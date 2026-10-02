(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  navToggle?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-40% 0px -52% 0px', threshold: 0 });
  sections.forEach(s => sectionObs.observe(s));

  const canvas = document.getElementById('data-field');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  let points = [];
  let raf = 0;

  const makePoints = () => {
    const count = Math.max(34, Math.min(82, Math.round(w / 20)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + .6,
      vx: (Math.random() - .5) * .13,
      vy: (Math.random() - .5) * .13,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makePoints();
  };

  const drawCurve = (t) => {
    const centerX = w * .69;
    const baseY = h * .62;
    const sigma = Math.max(70, w * .065);
    const amp = Math.min(120, h * .13);
    ctx.beginPath();
    for (let x = centerX - sigma * 3.1; x <= centerX + sigma * 3.1; x += 3) {
      const z = (x - centerX) / sigma;
      const y = baseY - amp * Math.exp(-0.5 * z * z) * (0.92 + 0.08 * Math.sin(t * .0006));
      if (x === centerX - sigma * 3.1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    const grad = ctx.createLinearGradient(centerX - sigma * 2, 0, centerX + sigma * 2, 0);
    grad.addColorStop(0, 'rgba(113,87,255,0)');
    grad.addColorStop(.42, 'rgba(156,139,255,.45)');
    grad.addColorStop(.58, 'rgba(92,200,255,.48)');
    grad.addColorStop(1, 'rgba(92,200,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.35;
    ctx.stroke();
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    drawCurve(t);

    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      const glow = .28 + .18 * Math.sin(t * .001 + p.phase);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(170,190,255,${glow})`; ctx.fill();
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 105) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(122,143,235,${(1 - dist / 105) * .08})`;
          ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  raf = requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(draw);
  });
})();
