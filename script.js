
// mobile nav
const btn = document.getElementById('menu-toggle');
const nav = document.getElementById('nav-list');
btn.addEventListener('click', () => nav.classList.toggle('show'));

// footer year
document.getElementById('year').textContent = new Date().getFullYear();

// smooth scroll offset fix for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
  anchor.addEventListener('click', function(e){
    e.preventDefault();
    const targetId = this.getAttribute('href').slice(1);
    const el = document.getElementById(targetId);
    if(!el) return;
    const headerOffset = 100; // adjust for taller gradient header
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    if(nav.classList.contains('show')) nav.classList.remove('show');
  });
});

// simple hero slider (auto + manual)
const slidesEl = document.getElementById('hero-slides');
const slides = slidesEl.querySelectorAll('.hero-slide');
let current = 0;
const total = slides.length;

function showSlide(idx){
  slidesEl.style.transform = `translateX(-${idx * 100}%)`;
}
document.getElementById('hero-next').addEventListener('click', ()=>{ current = (current+1)%total; showSlide(current); });
document.getElementById('hero-prev').addEventListener('click', ()=>{ current = (current-1+total)%total; showSlide(current); });

// auto slide every 5s
let heroTimer = setInterval(()=>{ current = (current+1)%total; showSlide(current); }, 5000);
slidesEl.addEventListener('mouseenter', ()=> clearInterval(heroTimer));
slidesEl.addEventListener('mouseleave', ()=> { heroTimer = setInterval(()=>{ current = (current+1)%total; showSlide(current); }, 5000); });

// reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting) en.target.classList.add('in-view');
  });
},{ root:null, threshold:0.08, rootMargin:'0px 0px -10% 0px'});

document.querySelectorAll('[data-anim]').forEach(el=> io.observe(el));


// =============================
// WhatsApp Ordering (Cart)
// =============================
// Target number: 081382118029 (Indonesia)
const WA_NUMBER = '6281382118029';

function parseRupiahToNumber(rpText){
  // "Rp15.000" -> 15000
  if(!rpText) return 0;
  const digits = rpText.replace(/[^0-9]/g,'');
  return digits ? Number(digits) : 0;
}
function formatRupiah(n){
  // 15000 -> "Rp15.000"
  try{
    return 'Rp' + (n||0).toLocaleString('id-ID');
  }catch{
    return 'Rp' + String(n||0);
  }
}

const cart = new Map(); // key: name|price, value: {name, price, qty}

function cartKey(name, price){
  return `${name}__${price}`;
}

function addToCart(item){
  const key = cartKey(item.name, item.price);
  const existing = cart.get(key);
  if(existing){
    existing.qty += 1;
  }else{
    cart.set(key, { ...item, qty: 1 });
  }
  renderCart();
}

function setQty(key, qty){
  const it = cart.get(key);
  if(!it) return;
  it.qty = qty;
  if(it.qty <= 0) cart.delete(key);
  renderCart();
}

function getTotal(){
  let total = 0;
  cart.forEach(it=>{ total += (it.price * it.qty); });
  return total;
}

function buildWhatsAppMessage(){
  const name = (document.getElementById('order-name')?.value || '').trim();
  const note = (document.getElementById('order-note')?.value || '').trim();

  const lines = [];
  lines.push('Halo Selasar Coffe, saya ingin pesan:');
  cart.forEach(it=>{
    lines.push(`- ${it.name} x${it.qty} (${formatRupiah(it.price)})`);
  });
  lines.push(`Total: ${formatRupiah(getTotal())}`);
  if(name) lines.push(`Nama: ${name}`);
  if(note) lines.push(`Catatan: ${note}`);
  lines.push('Terima kasih.');

  return lines.join('\n');
}

function renderCart(){
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const waEl = document.getElementById('cart-wa');
  const fabEl = document.getElementById('cart-fab');

  if(!countEl || !itemsEl || !totalEl || !waEl || !fabEl) return;

  // count
  let count = 0;
  cart.forEach(it=>{ count += it.qty; });
  countEl.textContent = String(count);
  fabEl.classList.toggle('has-items', count > 0);

  // list
  itemsEl.innerHTML = '';

  if(count === 0){
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.innerHTML = '<p class="muted">Keranjang masih kosong. Tambahkan menu dulu ya 🙂</p>';
    itemsEl.appendChild(empty);
  }else{
    cart.forEach((it, key)=>{
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-row-main">
          <div class="cart-row-name">${it.name}</div>
          <div class="cart-row-price muted">${formatRupiah(it.price)}</div>
        </div>
        <div class="cart-row-qty">
          <button class="qty-btn" type="button" data-qty="dec" aria-label="Kurangi">−</button>
          <span class="qty-val" aria-label="Jumlah">${it.qty}</span>
          <button class="qty-btn" type="button" data-qty="inc" aria-label="Tambah">+</button>
        </div>
      `;
      row.querySelector('[data-qty="dec"]').addEventListener('click', ()=> setQty(key, it.qty - 1));
      row.querySelector('[data-qty="inc"]').addEventListener('click', ()=> setQty(key, it.qty + 1));
      itemsEl.appendChild(row);
    });
  }

  // total
  totalEl.textContent = formatRupiah(getTotal());

  // WhatsApp link
  if(count === 0){
    waEl.setAttribute('href', '#');
    waEl.setAttribute('aria-disabled', 'true');
    waEl.classList.add('disabled');
  }else{
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    waEl.setAttribute('href', url);
    waEl.removeAttribute('aria-disabled');
    waEl.classList.remove('disabled');
  }
}

function initMenuButtons(){
  const menuLis = document.querySelectorAll('#menu .menu-category li');
  if(!menuLis.length) return;

  menuLis.forEach(li=>{
    const spans = li.querySelectorAll('span');
    if(spans.length < 2) return;
    const name = spans[0].textContent.trim();
    const priceText = spans[1].textContent.trim();
    const price = parseRupiahToNumber(priceText);

    // avoid double-init
    if(li.querySelector('.add-btn')) return;

    li.classList.add('menu-item');
    li.dataset.name = name;
    li.dataset.price = String(price);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-btn';
    btn.textContent = 'Tambah';
    btn.addEventListener('click', ()=> addToCart({ name, price }));
    li.appendChild(btn);
  });
}

function initCartModal(){
  const modal = document.getElementById('cart-modal');
  const fab = document.getElementById('cart-fab');
  const clearBtn = document.getElementById('cart-clear');
  const closeEls = document.querySelectorAll('[data-close="cart"]');
  const nameEl = document.getElementById('order-name');
  const noteEl = document.getElementById('order-note');
  const waEl = document.getElementById('cart-wa');

  if(!modal || !fab) return;

  const open = ()=>{
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
  };
  const close = ()=>{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
  };

  fab.addEventListener('click', open);
  closeEls.forEach(el=> el.addEventListener('click', close));
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  clearBtn?.addEventListener('click', ()=>{ cart.clear(); renderCart(); });
  nameEl?.addEventListener('input', renderCart);
  noteEl?.addEventListener('input', renderCart);

  // More reliable WhatsApp open behavior (mobile app fallback + web fallback)
  waEl?.addEventListener('click', (e)=>{
    if(waEl.classList.contains('disabled')){
      e.preventDefault();
      return;
    }

    const msg = buildWhatsAppMessage();
    const waWeb = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    const waApp = `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    if(isMobile){
      // Try opening the WhatsApp app first, then fall back to wa.me
      window.location.href = waApp;
      setTimeout(()=>{ window.location.href = waWeb; }, 900);
    }else{
      // Desktop: open in a new tab
      window.open(waWeb, '_blank', 'noopener');
    }
    e.preventDefault();
  });
}

// init after DOM is ready
document.addEventListener('DOMContentLoaded', ()=>{
  initMenuButtons();
  initCartModal();
  renderCart();
});
