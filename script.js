
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

// Handle order form submission
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form from submitting the traditional way

    // Get values from the form
    const name = document.getElementById('name').value;
    const product = document.getElementById('product').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    // Set prices for each product (simulated)
    const prices = {
        kopi: 25000,  // Price per item for Kopi
        teh: 15000,   // Price per item for Teh
        susu: 20000   // Price per item for Susu
    };

    // Calculate total price
    const totalPrice = prices[product] * quantity;

    // Show payment section and update the total
    document.getElementById('totalPayment').textContent = `Rp. ${totalPrice.toLocaleString()}`;
    document.getElementById('paymentSection').style.display = 'block';
});
