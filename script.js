// ── SMOOTH SCROLL (skip .btn-rent links — handled by selectCar) ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  if (link.classList.contains('btn-rent')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── ACTIVE NAV ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});

// ── RENT CAR → AUTO SELECT IN BOOKING FORM ──
function selectCar(btn) {
  // Get car name from h4 in the same card
  const carName = btn.closest('.car-card').querySelector('h4').textContent.trim();

  // Find matching option by text content
  const select = document.querySelector('.booking-form select');
  for (let i = 0; i < select.options.length; i++) {
    const optText = select.options[i].text.toLowerCase();
    if (optText.includes(carName.toLowerCase())) {
      select.selectedIndex = i;
      break;
    }
  }

  // Scroll to booking section smoothly
  setTimeout(() => {
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);

  return false;
}

// ── GOOGLE APPS SCRIPT WEB APP URL ──
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzE0Oi-8WsHDiY9MdyaikIKpFvO-1aYL8Xa_EOiLFQgzJb2-z1_YJ41XSRWX_aiv6Ot/exec";

// ── BOOKING FORM SUBMIT ──
async function submitBooking(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('.btn-book-full');
  const msg  = document.getElementById('successMsg');

  const inputs = form.querySelectorAll('input[type="text"]');
  const dates  = form.querySelectorAll('input[type="date"]');

  const params = new URLSearchParams({
    name:       inputs[0].value,
    phone:      form.querySelector('input[type="tel"]').value,
    car:        form.querySelector('select').value,
    pickup:     inputs[1].value,
    pickupDate: dates[0].value,
    returnDate: dates[1].value,
  });

  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SHEET_URL + '?' + params.toString() + '&callback=handleSheetResponse';
      window.handleSheetResponse = function(data) {
        document.head.removeChild(script);
        delete window.handleSheetResponse;
        resolve(data);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  } catch (err) {
    const img = new Image();
    img.src = SHEET_URL + '?' + params.toString();
  }

  msg.style.display = 'block';
  msg.innerHTML = '<i class="fas fa-check-circle"></i> Booking confirmed! We\'ll call you shortly.';
  msg.style.background = 'rgba(76,175,80,0.15)';
  msg.style.borderColor = '#4caf50';
  msg.style.color = '#81c784';
  form.reset();
  msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { msg.style.display = 'none'; }, 6000);

  btn.innerHTML = 'Confirm Booking <i class="fas fa-check"></i>';
  btn.disabled = false;
}

// ── MIN DATE FOR DATE INPUTS ──
const today = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(i => i.setAttribute('min', today));
