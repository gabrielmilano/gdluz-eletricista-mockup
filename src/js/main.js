/* GDLUZ Eletricista — interações */
(() => {
    // Número do WhatsApp no formato 55 + DDD + número (só dígitos). Vazio = abre o WhatsApp para escolher o contato.
    const WHATSAPP = '';
    const DEFAULT_MSG = 'Olá Gabriel! Vim pelo site da GDLUZ e gostaria de um orçamento.';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- links do WhatsApp ----------
    document.querySelectorAll('[data-wa]').forEach(a => {
        const msg = encodeURIComponent(a.dataset.msg || DEFAULT_MSG);
        a.href = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${msg}` : `https://wa.me/?text=${msg}`;
        a.target = '_blank';
        a.rel = 'noopener';
    });

    // ---------- navbar, progresso, botão flutuante ----------
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    const waFloat = document.querySelector('.wa-float');
    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        navbar.classList.toggle('is-scrolled', y > 30);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        waFloat.classList.toggle('is-shown', y > window.innerHeight * .6);
        updateSteps();
    };

    // menu mobile
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }));

    // link ativo conforme a seção
    const links = [...document.querySelectorAll('.navbar__link')];
    const sectionObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => {
        const s = document.querySelector(l.getAttribute('href'));
        if (s) sectionObs.observe(s);
    });

    // ---------- reveal ----------
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // cards de serviço entram em cascata
    document.querySelectorAll('.services .card').forEach((c, i) => c.style.setProperty('--d', `${(i % 4) * .08}s`));

    // ---------- texto rotativo do hero ----------
    const rotator = document.getElementById('rotator');
    const words = ['casa', 'empresa', 'comércio', 'casa inteligente', 'reforma'];
    if (rotator && !reduceMotion) {
        let w = 0, i = words[0].length, deleting = true;
        const tick = () => {
            const word = words[w];
            rotator.textContent = word.slice(0, i);
            let delay = deleting ? 55 : 95;
            if (deleting) {
                if (--i < 0) { deleting = false; w = (w + 1) % words.length; i = 0; delay = 250; }
            } else if (++i > words[w].length) {
                deleting = true; i = words[w].length; delay = 2000;
            }
            setTimeout(tick, delay);
        };
        setTimeout(tick, 2600);
    }

    // ---------- brilho que segue o mouse no hero ----------
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    });

    // ---------- faíscas no hero ----------
    const canvas = document.getElementById('sparks');
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        let W, H, dpr, parts = [], running = true;
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const spawn = () => ({
            x: Math.random() * W,
            y: H + Math.random() * H * .3,
            r: Math.random() * 1.6 + .4,
            vy: -(Math.random() * .6 + .2),
            vx: (Math.random() - .5) * .3,
            a: Math.random() * .6 + .2,
            t: Math.random() * Math.PI * 2
        });
        resize();
        const count = W < 700 ? 35 : 70;
        for (let k = 0; k < count; k++) { const p = spawn(); p.y = Math.random() * H; parts.push(p); }
        const draw = () => {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            parts.forEach(p => {
                p.t += .03; p.x += p.vx + Math.sin(p.t) * .2; p.y += p.vy;
                if (p.y < -10) Object.assign(p, spawn());
                const alpha = p.a * (.6 + Math.sin(p.t * 2) * .4);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 80, ${alpha})`;
                ctx.shadowColor = '#FFD166'; ctx.shadowBlur = 8;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        new IntersectionObserver(([e]) => {
            const was = running; running = e.isIntersecting;
            if (running && !was) draw();
        }).observe(hero);
        window.addEventListener('resize', resize);
        draw();
    }

    // ---------- tilt 3D nos cards ----------
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
        document.querySelectorAll('.services .card').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.classList.add('is-tilting');
                card.style.setProperty('--ry', `${(px - .5) * 10}deg`);
                card.style.setProperty('--rx', `${(.5 - py) * 10}deg`);
                card.style.setProperty('--px', `${px * 100}%`);
                card.style.setProperty('--py', `${py * 100}%`);
            });
            card.addEventListener('pointerleave', () => {
                card.classList.remove('is-tilting');
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    // ---------- linha do processo acende com o scroll ----------
    const stepsWrap = document.getElementById('steps');
    const stepsFill = document.getElementById('stepsFill');
    const steps = [...document.querySelectorAll('.step')];
    function updateSteps() {
        if (!stepsWrap) return;
        const r = stepsWrap.getBoundingClientRect();
        const mark = window.innerHeight * .6;
        const f = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
        stepsFill.style.setProperty('--fill', f);
        steps.forEach(s => {
            const n = s.querySelector('.step__n').getBoundingClientRect();
            s.classList.toggle('is-lit', n.top + n.height / 2 < mark);
        });
    }

    // ---------- demo casa inteligente ----------
    const rooms = document.querySelectorAll('.plan__room');
    const toggles = document.querySelectorAll('.tg');
    const status = document.getElementById('smartStatus');
    const setRoom = (name, on) => {
        document.querySelector(`.plan__room[data-room="${name}"]`).classList.toggle('is-on', on);
        document.querySelector(`.tg[data-room="${name}"]`).setAttribute('aria-pressed', on);
        const n = document.querySelectorAll('.plan__room.is-on').length;
        status.textContent = `${n} de ${rooms.length} ligados`;
    };
    toggles.forEach(t => t.addEventListener('click', () => setRoom(t.dataset.room, t.getAttribute('aria-pressed') !== 'true')));
    rooms.forEach(r => r.addEventListener('click', () => setRoom(r.dataset.room, !r.classList.contains('is-on'))));
    document.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => {
        const on = b.dataset.scene ? b.dataset.scene.split(',') : [];
        rooms.forEach((r, i) => setTimeout(() => setRoom(r.dataset.room, on.includes(r.dataset.room)), i * 120));
    }));
    // acende a sala sozinha na primeira vez que a demo aparece, para mostrar que é interativo
    const plan = document.getElementById('plan');
    new IntersectionObserver(([e], obs) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        setTimeout(() => setRoom('sala', true), 700);
        setTimeout(() => setRoom('varanda', true), 1300);
    }, { threshold: .5 }).observe(plan);

    // ---------- lâmpada pendente (puxar a cordinha) ----------
    const pendant = document.getElementById('pendant');
    const about = document.getElementById('sobre');
    pendant.addEventListener('click', () => {
        const on = pendant.getAttribute('aria-pressed') !== 'true';
        pendant.setAttribute('aria-pressed', on);
        about.classList.toggle('is-dark', !on);
    });

    // ---------- contadores ----------
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            counterObs.unobserve(e.target);
            const el = e.target, from = +el.dataset.from, to = +el.dataset.to;
            if (reduceMotion) { el.textContent = to; return; }
            const dur = 1800, start = performance.now();
            const step = now => {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(from + (to - from) * eased);
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: .6 });
    document.querySelectorAll('.counter').forEach(c => counterObs.observe(c));

    document.getElementById('year').textContent = new Date().getFullYear();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateSteps);
    onScroll();
})();
