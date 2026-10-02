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

  document.querySelectorAll('[data-scroll-top]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

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
    const count = Math.max(42, Math.min(96, Math.round(w / 18)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.35 + .5,
      vx: (Math.random() - .5) * .11,
      vy: (Math.random() - .5) * .11,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makePoints();
  };

  const gaussian = z => Math.exp(-0.5 * z * z);

  const drawDensity = (t) => {
    const centerX = w * .70;
    const baseY = h * .66;
    const sigma = Math.max(64, w * .057);
    const amp = Math.min(118, h * .13);
    ctx.beginPath();
    for (let x = centerX - sigma * 3.1; x <= centerX + sigma * 3.1; x += 3) {
      const z = (x - centerX) / sigma;
      const y = baseY - amp * gaussian(z) * (.95 + .05 * Math.sin(t * .00055));
      if (x <= centerX - sigma * 3.05) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    const grad = ctx.createLinearGradient(centerX - sigma * 2.2, 0, centerX + sigma * 2.2, 0);
    grad.addColorStop(0, 'rgba(113,87,255,0)');
    grad.addColorStop(.35, 'rgba(157,138,255,.52)');
    grad.addColorStop(.62, 'rgba(92,200,255,.56)');
    grad.addColorStop(1, 'rgba(92,200,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const arrow = (x1, y1, x2, y2, alpha=.24) => {
    const angle = Math.atan2(y2-y1, x2-x1);
    ctx.beginPath();
    ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle = `rgba(166,150,255,${alpha})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    const size = 7;
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-size*Math.cos(angle-.45), y2-size*Math.sin(angle-.45));
    ctx.lineTo(x2-size*Math.cos(angle+.45), y2-size*Math.sin(angle+.45));
    ctx.closePath();
    ctx.fillStyle = `rgba(166,150,255,${alpha+.06})`;
    ctx.fill();
  };

  const drawCausalDAG = (t) => {
    const cx = w * .60, cy = h * .30;
    const pulse = .85 + .15*Math.sin(t*.001);
    const nodes = [
      [cx, cy-62], [cx-70, cy+30], [cx+70, cy+30]
    ];
    arrow(nodes[0][0]-8,nodes[0][1]+18,nodes[1][0]+10,nodes[1][1]-14,.22);
    arrow(nodes[0][0]+8,nodes[0][1]+18,nodes[2][0]-10,nodes[2][1]-14,.22);
    arrow(nodes[1][0]+22,nodes[1][1],nodes[2][0]-22,nodes[2][1],.16);
    for (const [x,y] of nodes) {
      ctx.beginPath(); ctx.arc(x,y,18*pulse,0,Math.PI*2);
      ctx.fillStyle='rgba(10,18,42,.42)'; ctx.fill();
      ctx.strokeStyle='rgba(150,132,255,.42)'; ctx.lineWidth=1.2; ctx.stroke();
    }
  };

  const drawClusters = (t) => {
    const centers = [
      [w*.38,h*.31,'104,208,255'],
      [w*.43,h*.36,'126,102,255'],
      [w*.35,h*.39,'101,230,196']
    ];
    centers.forEach((c,ci)=>{
      const [cx,cy,col]=c;
      for(let i=0;i<25;i++){
        const a=(i*2.399)+(ci*.8);
        const rr=(8+(i%9)*3.1)*(1+.04*Math.sin(t*.0008+i));
        const x=cx+Math.cos(a)*rr*(1+ci*.08);
        const y=cy+Math.sin(a)*rr*.62;
        ctx.beginPath(); ctx.arc(x,y,1.15+(i%3)*.18,0,Math.PI*2);
        ctx.fillStyle=`rgba(${col},${.20+(i%5)*.035})`; ctx.fill();
      }
    });
  };

  const drawHeatmap = () => {
    const x0=w*.79, y0=h*.72, s=Math.max(8,Math.min(15,w*.009));
    for(let r=0;r<6;r++){
      for(let c=0;c<8;c++){
        const val=Math.sin((r+1)*(c+2)*.52);
        const pos=val>0;
        const alpha=.035+Math.abs(val)*.09;
        ctx.fillStyle=pos?`rgba(92,200,255,${alpha})`:`rgba(154,133,255,${alpha})`;
        ctx.fillRect(x0+c*(s+2),y0+r*(s+2),s,s);
      }
    }
  };

  const drawBands = (t) => {
    const x0=w*.25, y0=h*.73, ww=w*.23, hh=h*.12;
    ctx.beginPath();
    for(let i=0;i<=45;i++){
      const x=x0+ww*(i/45);
      const u=i/45;
      const y=y0-hh*(.15+.62*u+.09*Math.sin(u*8+t*.00045));
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(101,230,196,.28)'; ctx.lineWidth=1.3; ctx.stroke();

    ctx.beginPath();
    for(let i=0;i<=45;i++){
      const x=x0+ww*(i/45);
      const u=i/45;
      const y=y0-hh*(.24+.47*u+.08*Math.cos(u*7+t*.00035));
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(242,200,108,.22)'; ctx.lineWidth=1.15; ctx.stroke();
  };

  const draw = (t) => {
    ctx.clearRect(0,0,w,h);

    drawDensity(t);
    drawCausalDAG(t);
    drawClusters(t);
    drawHeatmap();
    drawBands(t);

    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      const glow = .20 + .15 * Math.sin(t * .001 + p.phase);
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(170,190,255,${glow})`;
      ctx.fill();
    }

    for (let i=0;i<points.length;i++) {
      for (let j=i+1;j<points.length;j++) {
        const a=points[i], b=points[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist=Math.hypot(dx,dy);
        if(dist<92){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(122,143,235,${(1-dist/92)*.055})`;
          ctx.lineWidth=.55; ctx.stroke();
        }
      }
    }

    raf=requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive:true });
  raf=requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) cancelAnimationFrame(raf);
    else raf=requestAnimationFrame(draw);
  });
})();
