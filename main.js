'use strict';

/* ══════════════════════════════════════
   CURSOR
══════════════════════════════════════ */
const dot  = document.getElementById('curDot');
const ring = document.getElementById('curRing');
let mx=0,my=0,rx=0,ry=0,rafCursor;

if(dot && ring){
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
  },{passive:true});
  (function followRing(){
    rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
    ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(followRing);
  })();
  // Hover expand
  document.querySelectorAll('a,button,.door-unit,.a-card,.win-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hov'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hov'));
  });
}
// Mobile: restore cursor
if('ontouchstart' in window){
  if(dot) dot.style.display='none';
  if(ring) ring.style.display='none';
  document.body.style.cursor='auto';
}

/* ══════════════════════════════════════
   PENDANT LAMP / ACCESSIBLE THEME TOGGLE
══════════════════════════════════════ */
const lampBtn = document.getElementById('lampBtn');
const root = document.documentElement;
const themeKey = 'kkg-theme';
let isLight = false;

try {
  isLight = localStorage.getItem(themeKey) === 'light';
} catch (error) {
  isLight = false;
}

function applyTheme(light) {
  isLight = Boolean(light);
  root.setAttribute('data-theme', isLight ? 'light' : 'dark');
  if (lampBtn) {
    lampBtn.setAttribute('aria-pressed', String(isLight));
    lampBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    lampBtn.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }
  try { localStorage.setItem(themeKey, isLight ? 'light' : 'dark'); } catch (error) {}
  // Keep the door arch mask synchronized with the active page surface.
  document.querySelectorAll('.door-mask').forEach(mask => {
    mask.style.boxShadow = '0 0 0 10px var(--mask)';
  });
}
applyTheme(isLight);

lampBtn?.addEventListener('click', () => {
  applyTheme(!isLight);
  lampBtn.animate(
    [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-12deg) scale(1.13)' }, { transform: 'rotate(0) scale(1)' }],
    { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }
  );
});

/* ══════════════════════════════════════
   HEADER CLOCK
══════════════════════════════════════ */
function updateHeaderClock(){
  const now = new Date();
  const t = document.getElementById('hdrTime');
  const d = document.getElementById('hdrDate');
  if(t) t.textContent = now.toLocaleTimeString('en-IN',{
    hour:'2-digit',minute:'2-digit',
    timeZone:'Asia/Kolkata',hour12:true
  }).toLowerCase();
  if(d) d.textContent = now.toLocaleDateString('en-IN',{
    day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'
  });
}
updateHeaderClock();
setInterval(updateHeaderClock,1000);

/* ══════════════════════════════════════
   FOOTER CLOCK
══════════════════════════════════════ */
function updateFooterClock(){
  const el=document.getElementById('footerClock');
  if(!el)return;
  el.textContent='IST '+new Date().toLocaleTimeString('en-IN',{
    timeZone:'Asia/Kolkata',hour12:false
  });
}
updateFooterClock();
setInterval(updateFooterClock,1000);

/* ══════════════════════════════════════
   HEADER HIDE/SHOW ON SCROLL
══════════════════════════════════════ */
const hdr=document.getElementById('hdr');
let lastY=0,hdrHidden=false;
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  if(y>80){
    if(y>lastY && !hdrHidden){hdr.classList.add('hidden');hdrHidden=true}
    else if(y<lastY && hdrHidden){hdr.classList.remove('hidden');hdrHidden=false}
  }else{hdr.classList.remove('hidden');hdrHidden=false}
  lastY=y;
  // Active nav
  const sections=document.querySelectorAll('section[id]');
  let cur='';
  sections.forEach(s=>{if(window.scrollY>=s.offsetTop-130)cur=s.id});
  document.querySelectorAll('.hn').forEach(l=>
    l.classList.toggle('active',l.getAttribute('href')==='#'+cur));
},{passive:true});

/* ══════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════ */
const mobToggle=document.getElementById('mobToggle');
const hdrNav=document.getElementById('hdrNav');
if(mobToggle && hdrNav){
  mobToggle.addEventListener('click',()=>{
    const opened = mobToggle.classList.toggle('open');
    hdrNav.classList.toggle('open', opened);
    mobToggle.setAttribute('aria-expanded', String(opened));
    mobToggle.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
    document.body.style.overflow = opened ? 'hidden' : '';
  });
  hdrNav.querySelectorAll('.hn').forEach(l=>l.addEventListener('click',()=>{
    mobToggle.classList.remove('open');
    hdrNav.classList.remove('open');
    mobToggle.setAttribute('aria-expanded', 'false');
    mobToggle.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow='';
  }));
}

/* ══════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
  });
});

/* ══════════════════════════════════════
   NOTEPAD ROLE FLIPPER
══════════════════════════════════════ */
const slides  = Array.from(document.querySelectorAll('.np-slide'));
const counter = document.getElementById('notepadCounter');
let current   = 0;
let flipping  = false;

function flipTo(next){
  if(flipping || next===current) return;
  flipping=true;
  const cur=slides[current];
  const nxt=slides[next];

  // Animate out
  cur.classList.remove('active');
  cur.classList.add('exit-up');

  // Animate in (slight delay)
  setTimeout(()=>{
    cur.classList.remove('exit-up');
    nxt.classList.add('enter-down');
    nxt.style.opacity='0';

    requestAnimationFrame(()=>{
      nxt.style.opacity='';
      nxt.classList.add('active');
    });

    setTimeout(()=>{
      nxt.classList.remove('enter-down');
      current=next;
      flipping=false;
      if(counter) counter.textContent=
        String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    },360);
  },320);
}

// Auto-rotate every 2.4 seconds
if(slides.length>1){
  setInterval(()=>{
    flipTo((current+1)%slides.length);
  },2400);
}

/* ══════════════════════════════════════
   INTERACTIVE DOORS — CLICK / TAP / KEYBOARD
══════════════════════════════════════ */
const doorUnits = [...document.querySelectorAll('.door-unit')];
const hint = document.getElementById('doorsHint');
let openDoor = null;

function closeDoor(unit) {
  if (!unit) return;
  unit.classList.remove('open');
  unit.setAttribute('aria-expanded', 'false');
  const panel = unit.querySelector('.door-panel');
  if (panel) panel.style.transform = '';
  if (openDoor === unit) openDoor = null;
  if (!openDoor && hint) hint.classList.remove('hidden');
}

function openDoorUnit(unit) {
  if (!unit) return;
  if (openDoor === unit) {
    closeDoor(unit);
    return;
  }
  if (openDoor) closeDoor(openDoor);
  const panel = unit.querySelector('.door-panel');
  // Clear hover-tilt inline styles before the CSS open animation takes over.
  if (panel) panel.style.transform = '';
  unit.classList.add('open');
  unit.setAttribute('aria-expanded', 'true');
  openDoor = unit;
  if (hint) hint.classList.add('hidden');
}

doorUnits.forEach(unit => {
  const panel = unit.querySelector('.door-panel');
  unit.addEventListener('click', () => openDoorUnit(unit));
  unit.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDoorUnit(unit);
    }
    if (event.key === 'Escape') closeDoor(unit);
  });

  unit.addEventListener('pointermove', event => {
    if (unit.classList.contains('open') || event.pointerType !== 'mouse') return;
    const rect = unit.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
    const y = ((event.clientY - rect.top) / rect.height - .5) * -4;
    if (panel) panel.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  });
  unit.addEventListener('pointerleave', () => {
    if (!unit.classList.contains('open') && panel) panel.style.transform = '';
  });
});

document.addEventListener('click', event => {
  if (openDoor && !openDoor.contains(event.target)) closeDoor(openDoor);
});

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */
const revObs = new IntersectionObserver((entries)=>{
  entries.forEach((entry,i)=>{
    if(!entry.isIntersecting) return;
    // Stagger siblings in same grid
    const parent = entry.target.closest(
      '.about-cards,.wins-grid,.soft-grid,.personal-cards,.skills-grid,.about-grid'
    );
    if(parent){
      const peers=[...parent.querySelectorAll('.rev:not(.in)')];
      peers.forEach((el,idx)=>{
        setTimeout(()=>el.classList.add('in'), idx*75);
      });
    } else {
      entry.target.classList.add('in');
    }
    revObs.unobserve(entry.target);
  });
},{threshold:0.1,rootMargin:'0px 0px -30px 0px'});

document.querySelectorAll('.rev').forEach(el=>revObs.observe(el));

/* ══════════════════════════════════════
   SKILL BARS — animate on scroll
══════════════════════════════════════ */
const skillObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.sk-fill').forEach(f=>f.classList.add('go'));
    skillObs.unobserve(e.target);
  });
},{threshold:0.3});
document.querySelectorAll('.sk-group').forEach(g=>skillObs.observe(g));

/* ══════════════════════════════════════
   DOORS REVEAL (staggered entrance)
══════════════════════════════════════ */
const doorsObs=new IntersectionObserver(entries=>{
  if(!entries[0].isIntersecting) return;
  doorUnits.forEach((u,i)=>{
    u.style.opacity='0';
    u.style.transform='translateY(40px)';
    u.style.transition=`opacity .7s ${i*.1}s, transform .7s ${i*.1}s`;
    setTimeout(()=>{
      u.style.opacity='1';
      u.style.transform='';
    },50+i*100);
  });
  doorsObs.unobserve(entries[0].target);
},{threshold:0.15});
const doorsSection=document.querySelector('.doors-section');
if(doorsSection) doorsObs.observe(doorsSection);

/* ══════════════════════════════════════
   INTERACTIVE JOURNEY TIMELINE
══════════════════════════════════════ */
const timelineItems = [...document.querySelectorAll('.timeline .tl')];

function toggleTimelineItem(item) {
  const expanded = item.getAttribute('aria-expanded') === 'true';
  // Keep the timeline focused: only one chapter expanded at a time.
  timelineItems.forEach(other => other.setAttribute('aria-expanded', 'false'));
  item.setAttribute('aria-expanded', String(!expanded));
}

timelineItems.forEach(item => {
  item.addEventListener('click', () => toggleTimelineItem(item));
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTimelineItem(item);
    }
  });
});


/* ══════════════════════════════════════
   INTERACTIVE KKG IDENTITY CARD
══════════════════════════════════════ */
const identityCard = document.getElementById('identityCard');
if (identityCard) {
  const flipIdentityCard = () => {
    const flipped = identityCard.classList.toggle('is-flipped');
    identityCard.setAttribute('aria-pressed', String(flipped));
  };
  identityCard.addEventListener('click', flipIdentityCard);
  identityCard.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flipIdentityCard();
    }
  });
  identityCard.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || identityCard.classList.contains('is-flipped')) return;
    const rect = identityCard.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const ry = (px - .5) * 9;
    const rx = (.5 - py) * 7;
    identityCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  identityCard.addEventListener('pointerleave', () => {
    if (!identityCard.classList.contains('is-flipped')) identityCard.style.transform = '';
  });
}

/* ══════════════════════════════════════
   CONTACT FORM — OPENS THE USER'S EMAIL APP
══════════════════════════════════════ */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}
Email: ${email}

${message}`);
    const mailto = `mailto:kamal@sliet.ac.in?subject=${subject}&body=${body}`;
    const status = document.getElementById('formStatus');
    if (status) status.textContent = 'Opening your email app with the message…';
    window.location.href = mailto;
  });
}

/* ══════════════════════════════════════
   HERO ENTRANCE (runs on page load)
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  // Stagger hero elements in
  const heroEls=[
    '.hero-tag','.hero-name','.hero-iam','.notepad','.hero-ctas',
    '.hero-photo-frame','.hero-bar'
  ];
  heroEls.forEach((sel,i)=>{
    const el=document.querySelector(sel);
    if(!el) return;
    el.style.opacity='0';
    el.style.transform='translateY(22px)';
    el.style.transition=`opacity .7s ${.1+i*.1}s, transform .7s ${.1+i*.1}s`;
    // Trigger
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.opacity='1';
      el.style.transform='none';
    }));
  });
});


/* ══════════════════════════════════════
   ABOUT — PROFILE SLIDER
══════════════════════════════════════ */
(() => {
  const viewport = document.getElementById('aboutSlider');
  if (!viewport) return;
  const slides = [...viewport.querySelectorAll('.about-slide')];
  const dots = [...document.querySelectorAll('#aboutSliderDots button')];
  const index = document.getElementById('aboutSlideIndex');
  let current = 0, startX = 0;
  const show = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    if (index) index.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };
  document.getElementById('aboutPrev')?.addEventListener('click', () => show(current - 1));
  document.getElementById('aboutNext')?.addEventListener('click', () => show(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.go))));
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  viewport.addEventListener('pointerdown', e => { startX = e.clientX; });
  viewport.addEventListener('pointerup', e => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
  });
})();

/* ══════════════════════════════════════
   SKILLS — CATEGORY TABS
══════════════════════════════════════ */
(() => {
  const data = {
    programming: { label: '01 / PROGRAMMING', skills: ['C', 'C++', 'JavaScript', 'Python'], note: 'Building strong fundamentals through practice and small projects.' },
    web: { label: '02 / WEB DEVELOPMENT', skills: ['HTML', 'CSS', 'React', 'TypeScript', 'Node.js'], note: 'Exploring responsive interfaces, frontend components and web application basics.' },
    electronics: { label: '03 / ELECTRONICS', skills: ['Embedded Systems', 'Arduino', 'ESP8266', 'Sensors', 'Circuit Design'], note: 'Learning how microcontrollers, sensors and code work together in practical prototypes.' },
    tools: { label: '04 / TOOLS & PLATFORMS', skills: ['Git & GitHub', 'VS Code', 'Linux', 'Figma', 'REST APIs', 'Gemini API', 'Notion'], note: 'Tools used while learning, collaborating and building projects.' }
  };
  const tabs = [...document.querySelectorAll('.skill-tab')];
  const list = document.getElementById('skillsChipList');
  const label = document.getElementById('skillsPanelEyebrow');
  const note = document.getElementById('skillsPanelNote');
  function select(key) {
    const item = data[key];
    if (!item || !list) return;
    tabs.forEach(tab => {
      const active = tab.dataset.skill === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (label) label.textContent = item.label;
    if (note) note.textContent = item.note;
    list.replaceChildren(...item.skills.map((skill, i) => {
      const chip = document.createElement('span');
      chip.textContent = skill;
      chip.style.animationDelay = `${i * 55}ms`;
      return chip;
    }));
  }
  tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.skill)));
})();

/* ══════════════════════════════════════
   ACHIEVEMENTS — DRAGGABLE CAROUSEL
══════════════════════════════════════ */
(() => {
  const viewport = document.getElementById('winsViewport');
  const track = document.getElementById('winsTrack');
  if (!viewport || !track) return;
  const cards = [...track.children];
  const counter = document.getElementById('winsCounter');
  let dragging = false, startX = 0, scrollStart = 0;
  const step = () => cards[0]?.getBoundingClientRect().width + 18 || 300;
  const update = () => {
    const active = Math.min(cards.length, Math.max(1, Math.round(viewport.scrollLeft / step()) + 1));
    if (counter) counter.textContent = `${String(active).padStart(2, '0')} — ${String(cards.length).padStart(2, '0')}`;
  };
  document.getElementById('winsPrev')?.addEventListener('click', () => viewport.scrollBy({ left: -step(), behavior: 'smooth' }));
  document.getElementById('winsNext')?.addEventListener('click', () => viewport.scrollBy({ left: step(), behavior: 'smooth' }));
  viewport.addEventListener('scroll', update, { passive: true });
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') {
      dragging = true; startX = e.clientX; scrollStart = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    }
  });
  viewport.addEventListener('pointermove', e => {
    if (dragging) viewport.scrollLeft = scrollStart - (e.clientX - startX);
  });
  const stop = () => { dragging = false; viewport.classList.remove('is-dragging'); };
  viewport.addEventListener('pointerup', stop);
  viewport.addEventListener('pointercancel', stop);
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') viewport.scrollBy({ left: step(), behavior: 'smooth' });
    if (e.key === 'ArrowLeft') viewport.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  update();
})();

/* ══════════════════════════════════════
   PROJECTS — EXPANDING 3D PANELS
══════════════════════════════════════ */
(() => {
  const panels = [...document.querySelectorAll('.project-panel')];
  const activate = panel => {
    panels.forEach(item => {
      const active = item === panel;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-expanded', String(active));
    });
  };
  panels.forEach(panel => {
    panel.addEventListener('click', () => activate(panel));
    panel.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(panel); }
    });
    panel.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) activate(panel);
    });
  });
})();

/* ══════════════════════════════════════
   JOURNEY — SCROLL-DRAWN CURVED PATH
══════════════════════════════════════ */
(() => {
  const section = document.getElementById('curvedJourney');
  const path = document.getElementById('journeyPathProgress');
  if (!section || !path) return;
  let length = 0, ticking = false;
  const measure = () => {
    try {
      length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    } catch (e) {}
  };
  const draw = () => {
    if (!length) measure();
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 700;
    const progress = Math.max(0, Math.min(1, (vh * .78 - rect.top) / (rect.height + vh * .35)));
    path.style.strokeDashoffset = String(length * (1 - progress));
    section.querySelectorAll('.journey-node').forEach((node, i) => {
      const nodeRect = node.getBoundingClientRect();
      if (nodeRect.top < vh * .78) node.classList.add('is-reached');
      else node.classList.remove('is-reached');
    });
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(draw); }
  };
  measure(); draw();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); draw(); }, { passive: true });
  section.querySelectorAll('.journey-chapter').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      section.querySelectorAll('.journey-chapter').forEach(other => other.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });
})();
