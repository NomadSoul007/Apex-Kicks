
const money = value => `$${Number(value).toFixed(0)}`;
const cartKey = "premiumSneakerCart";

function getCart(){
  try{
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  }catch(e){
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el=>{
    el.textContent = count;
  });
}
function showToast(text){
  const toast = document.getElementById("toast");
  if(!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(()=> toast.classList.remove("show"), 2400);
}
function addToCart(id, qty=1, size=null){
  const product = PRODUCTS.find(p=>p.id===id);
  if(!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.id===id && item.size===size);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({
      id:product.id,
      name:product.name,
      price:product.price,
      image:product.image,
      category:product.category,
      size:size || "42",
      qty
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}
function removeCartItem(id, size){
  const cart = getCart().filter(item => !(item.id===id && item.size===size));
  saveCart(cart);
  renderCartPage();
}
function changeQty(id, size, delta){
  const cart = getCart();
  const item = cart.find(it => it.id===id && it.size===size);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    removeCartItem(id, size);
    return;
  }
  saveCart(cart);
  renderCartPage();
}
function renderProductCards(target, items){
  const container = document.querySelector(target);
  if(!container) return;
  container.innerHTML = items.map(product => `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}">
        <div class="badges">
          ${(product.badges || []).map(b => `<span class="badge">${b}</span>`).join("")}
          ${product.sale ? `<span class="badge dark">Sale</span>` : ``}
        </div>
      </div>
      <div class="product-top">
        <div>
          <div class="product-name">${product.name}</div>
          <div class="product-category">${product.category} · ${product.color}</div>
        </div>
        <div class="price">${money(product.price)}</div>
      </div>
      <p>${product.blurb}</p>
      <div class="product-actions">
        <a class="btn btn-secondary" href="product.html?id=${product.id}">View</a>
        <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to cart</button>
      </div>
    </article>
  `).join("");
}
function getPageParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
function renderHome(){
  renderProductCards("[data-featured-products]", PRODUCTS.filter(p => p.featured).slice(0,4));
  renderProductCards("[data-new-products]", PRODUCTS.filter(p => p.snkrs).slice(0,4));
}
function applyFilters(baseItems){
  const brand = document.querySelector('[data-filter-brand]')?.value || "all";
  const gender = document.querySelector('[data-filter-gender]')?.value || "all";
  const maxPrice = Number(document.querySelector('[data-filter-price]')?.value || 250);
  const search = (document.querySelector('[data-filter-search]')?.value || "").toLowerCase().trim();

  return baseItems.filter(item => {
    const okBrand = brand === "all" || item.brand.toLowerCase() === brand;
    const okGender = gender === "all" || item.gender === gender;
    const okPrice = item.price <= maxPrice;
    const okSearch = !search || `${item.name} ${item.category} ${item.brand}`.toLowerCase().includes(search);
    return okBrand && okGender && okPrice && okSearch;
  });
}
function renderListingPage(mode="all"){
  const grid = document.querySelector("[data-listing-grid]");
  if(!grid) return;

  let baseItems = [...PRODUCTS];
  if(mode==="men") baseItems = baseItems.filter(p => p.gender==="men");
  if(mode==="women") baseItems = baseItems.filter(p => p.gender==="women");
  if(mode==="sale") baseItems = baseItems.filter(p => p.sale);
  if(mode==="snkrs") baseItems = baseItems.filter(p => p.snkrs);
  if(mode==="new") baseItems = baseItems.filter(p => p.featured || p.snkrs);

  const render = () => {
    const filtered = applyFilters(baseItems);
    renderProductCards("[data-listing-grid]", filtered);
    const count = document.querySelector("[data-results-count]");
    if(count) count.textContent = `${filtered.length} styles`;
    const priceValue = document.querySelector("[data-price-value]");
    const priceInput = document.querySelector('[data-filter-price]');
    if(priceValue && priceInput) priceValue.textContent = `Up to ${money(priceInput.value)}`;
  };

  document.querySelectorAll("[data-filter-brand],[data-filter-gender],[data-filter-price],[data-filter-search]").forEach(el=>{
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
  render();
}
function renderProductPage(){
  const root = document.querySelector("[data-product-root]");
  if(!root) return;
  const id = getPageParam("id") || "noctra-phantom-x1";
  const product = PRODUCTS.find(p=>p.id===id) || PRODUCTS[0];

  document.title = `${product.name} — APEX KICKS`;
  root.innerHTML = `
    <div class="gallery">
      <div class="gallery-item hero-shot"><img src="${product.gallery[0]}" alt="${product.name}"></div>
      ${product.gallery.slice(1).map(img => `<div class="gallery-item"><img src="${img}" alt="${product.name}"></div>`).join("")}
    </div>
    <aside class="product-panel">
      <div class="breadcrumbs"><a href="index.html">Home</a> / <a href="new-featured.html">Shop</a> / <span>${product.name}</span></div>
      <div class="eyebrow">${product.brand} · Premium Release</div>
      <h1>${product.name}</h1>
      <div class="rating">★★★★★ <span style="color:var(--muted);font-weight:600">(4.9 / 5 · 312 reviews)</span></div>
      <p class="desc">${product.description}</p>
      <div class="price" style="margin:16px 0 20px">${money(product.price)} <span style="font-size:16px;color:var(--muted);text-decoration:line-through;margin-left:8px">${money(product.oldPrice)}</span></div>
      <div style="margin-bottom:18px">
        <div style="font-weight:800;margin-bottom:10px">Color</div>
        <div class="swatches">
          <button class="swatch active">${product.color}</button>
          <button class="swatch">Triple White</button>
          <button class="swatch">Shadow Grey</button>
        </div>
      </div>
      <div style="margin-bottom:18px">
        <div style="font-weight:800;margin-bottom:10px">Size</div>
        <div class="sizes">
          ${product.sizes.map((s,idx)=>`<button class="size-pill ${idx===3?'active':''}" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary" style="flex:1" data-product-add>Add to cart</button>
        <a class="btn btn-secondary" href="cart.html" style="flex:1;text-align:center">Go to cart</a>
      </div>
      <div class="info-list">
        <div class="info-row"><span>Category</span><strong>${product.category}</strong></div>
        <div class="info-row"><span>Delivery</span><strong>2–4 business days</strong></div>
        <div class="info-row"><span>Returns</span><strong>30-day easy return</strong></div>
        <div class="info-row"><span>Authenticity</span><strong>Verified pair</strong></div>
      </div>
      <div class="payment-box">
        <div style="font-weight:800;margin-bottom:8px">Pay button demo</div>
        <div class="mini-note">This project uses a fake checkout flow for presentation. The UI behaves like a real payment step, but no bank is connected.</div>
      </div>
    </aside>
  `;

  let chosenSize = String(product.sizes[3] || product.sizes[0]);
  root.querySelectorAll(".size-pill").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      root.querySelectorAll(".size-pill").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      chosenSize = btn.dataset.size;
    });
  });
  root.querySelector("[data-product-add]").addEventListener("click", ()=>{
    addToCart(product.id, 1, chosenSize);
  });

  renderProductCards("[data-related-products]", PRODUCTS.filter(p => p.id !== product.id).slice(0,4));
}
function renderCartPage(){
  const list = document.querySelector("[data-cart-items]");
  const summary = document.querySelector("[data-cart-summary]");
  if(!list || !summary) return;

  const cart = getCart();
  if(!cart.length){
    list.innerHTML = `
      <div style="padding:26px 0">
        <h3 style="margin:0 0 10px;font-size:32px">Your cart is empty.</h3>
        <p style="color:var(--muted);max-width:640px;line-height:1.7">Add a few pairs and come back. The cart uses localStorage, so products stay saved after refresh.</p>
        <a href="new-featured.html" class="btn btn-primary" style="margin-top:14px;display:inline-block">Shop now</a>
      </div>
    `;
    summary.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><strong>$0</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>$0</strong></div>
      <div class="summary-row total"><span>Total</span><strong>$0</strong></div>
    `;
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-thumb"><img src="${item.image}" alt="${item.name}"></div>
      <div>
        <h4>${item.name}</h4>
        <p>${item.category} · Size ${item.size}</p>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${item.id}','${item.size}',-1)">−</button>
          <strong>${item.qty}</strong>
          <button class="qty-btn" onclick="changeQty('${item.id}','${item.size}',1)">+</button>
          <button class="btn btn-secondary" style="padding:10px 14px" onclick="removeCartItem('${item.id}','${item.size}')">Remove</button>
        </div>
      </div>
      <div class="line-price">${money(item.qty * item.price)}</div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 300 ? 0 : 25;
  const tax = subtotal * 0.06;
  const total = subtotal + shipping + tax;

  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div class="summary-row"><span>Estimated tax</span><strong>${money(tax)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>${shipping === 0 ? 'Free' : money(shipping)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${money(total)}</strong></div>
  `;

  const payBtn = document.querySelector("[data-fake-pay]");
  if(payBtn){
    payBtn.onclick = () => {
      const card = document.querySelector('[name="card"]').value.trim();
      const name = document.querySelector('[name="name"]').value.trim();
      if(card.length < 12 || name.length < 2){
        showToast("Fill the demo payment form first");
        return;
      }
      payBtn.textContent = "Processing payment...";
      payBtn.disabled = true;
      setTimeout(()=>{
        localStorage.removeItem(cartKey);
        updateCartCount();
        showToast("Demo payment approved");
        const success = document.querySelector("[data-payment-success]");
        if(success) success.innerHTML = `
          <div style="margin-top:18px;padding:18px;border-radius:20px;background:rgba(37,194,110,.12);border:1px solid rgba(37,194,110,.35)">
            <div style="font-weight:900;font-size:20px;margin-bottom:6px">Payment successful</div>
            <div style="color:#d9e7df;line-height:1.7">This is a demo checkout. No real bank was charged. In a real project, this step would redirect to a payment provider or use a secured payment widget.</div>
          </div>
        `;
        renderCartPage();
        payBtn.textContent = "Paid";
      }, 1600);
    };
  }
}
function setActiveNav(){
  const file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link=>{
    const href = link.getAttribute("href");
    if(file === href) link.classList.add("active");
  });
}
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  setActiveNav();
  renderHome();
  renderProductPage();
  renderCartPage();
  if(document.body.dataset.page === "new") renderListingPage("new");
  if(document.body.dataset.page === "men") renderListingPage("men");
  if(document.body.dataset.page === "women") renderListingPage("women");
  if(document.body.dataset.page === "sale") renderListingPage("sale");
  if(document.body.dataset.page === "snkrs") renderListingPage("snkrs");
});
