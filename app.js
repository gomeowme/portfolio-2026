const menuButton = document.getElementById('menu-button');
const menuPanel = document.getElementById('menu-panel');
const motionIntro = document.querySelector('.motion-intro');
const imageOrbit = document.getElementById('image-orbit');
const introPhotos = [...document.querySelectorAll('.intro-photo')];
const customCursor = document.getElementById('custom-cursor');

function closeMenu() {
    menuPanel.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '메뉴 열기');
}

menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuPanel.hidden = isOpen;
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
});

menuPanel.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.menu-button') && !event.target.closest('.menu-panel')) {
        closeMenu();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

function updatePageView({ scroll = true } = {}) {
    const standalonePage = document.body.dataset.page;
    const currentHash = standalonePage && window.location.hash === '' ? `#${standalonePage}` : window.location.hash;
    const isHome = !standalonePage && (currentHash === '' || currentHash === '#home');
    document.body.classList.toggle('home-view', isHome);
    document.body.classList.toggle('project-view', !isHome);

    document.querySelectorAll('.site-nav a').forEach((link) => {
        const isCurrent = link.hash === (isHome ? '#home' : currentHash);
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    if (!isHome) {
        requestAnimationFrame(() => {
            const target = document.getElementById(currentHash.slice(1));
            if (!target) return;
            if (scroll) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo(0, 0);
            }
        });
    } else {
        window.scrollTo(0, 0);
    }

    closeMenu();
}

window.addEventListener('hashchange', updatePageView);
updatePageView();

const cvJumpLink = document.querySelector('.cv-jump-link');
cvJumpLink?.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById('cv');
    if (!target) return;

    window.history.pushState(null, '', '#cv');
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
});

let isTransitioning = false;

function createPageWipe() {
    const wipe = document.createElement('div');
    wipe.className = 'page-wipe';
    wipe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wipe);
    return wipe;
}

const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 520;

try {
    if (sessionStorage.getItem('page-wipe-transition') === 'true') {
        sessionStorage.removeItem('page-wipe-transition');
        const wipe = createPageWipe();
        wipe.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
            { duration: transitionDuration, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' }
        ).finished.then(() => wipe.remove());
    }
} catch (error) {
    console.error('Unable to restore the page transition.', error);
}

document.addEventListener('click', async (event) => {
    const projectsLink = event.target.closest('a[href="#projects"]');
    if (!projectsLink || !document.body.classList.contains('home-view') || isTransitioning) return;

    event.preventDefault();
    isTransitioning = true;

    const wipe = createPageWipe();

    await wipe.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: transitionDuration, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' }
    ).finished;

    window.history.pushState(null, '', '#projects');
    updatePageView({ scroll: false });

    await wipe.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
        { duration: transitionDuration, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' }
    ).finished;
    wipe.remove();
    isTransitioning = false;
});

document.addEventListener('click', async (event) => {
    const pageLink = event.target.closest('a[href="about.html#about"], a[href="contact.html#contact"], a[href="playground.html#playground"]');
    if (
        !pageLink ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        pageLink.target === '_blank' ||
        isTransitioning
    ) return;

    event.preventDefault();
    isTransitioning = true;
    const destination = pageLink.getAttribute('href');
    const wipe = createPageWipe();

    await wipe.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: transitionDuration, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' }
    ).finished;

    try {
        sessionStorage.setItem('page-wipe-transition', 'true');
    } catch (error) {
        console.error('Unable to save the page transition.', error);
    }
    window.location.assign(destination);
});

if (customCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('has-custom-cursor');
    let hoveredHeaderItem = null;

    document.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        customCursor.style.left = `${event.clientX}px`;
        customCursor.style.top = `${event.clientY}px`;
        customCursor.classList.add('is-visible');
        customCursor.classList.toggle('is-hovering', Boolean(event.target.closest('a, button')));

        const nextHeaderItem = event.target.closest('.site-header a, .menu-button');
        if (nextHeaderItem !== hoveredHeaderItem) {
            hoveredHeaderItem?.classList.remove('pointer-hover');
            nextHeaderItem?.classList.add('pointer-hover');
            hoveredHeaderItem = nextHeaderItem;
        }
    });

    document.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') customCursor.classList.add('is-pressed');
    });

    document.addEventListener('pointerup', () => {
        customCursor.classList.remove('is-pressed');
    });

    document.addEventListener('pointerleave', () => {
        customCursor.classList.remove('is-visible', 'is-hovering', 'is-pressed');
        hoveredHeaderItem?.classList.remove('pointer-hover');
        hoveredHeaderItem = null;
    });
}

if (motionIntro && imageOrbit && introPhotos.length > 0) {
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let rotationX = -8;
    let rotationY = -12;
    let previousFrameTime = 0;

    introPhotos.forEach((photo) => {
        photo.style.transform = `translate(-50%, -50%) rotateY(${Number(photo.dataset.angle)}deg) translateZ(390px)`;
    });

    function renderOrbit() {
        imageOrbit.style.transform = `translate(-50%, -50%) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    function animateOrbit(timestamp) {
        if (previousFrameTime && !isDragging) {
            rotationY += Math.min(timestamp - previousFrameTime, 50) * 0.006;
            renderOrbit();
        }
        previousFrameTime = timestamp;
        window.requestAnimationFrame(animateOrbit);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.requestAnimationFrame(animateOrbit);
    }

    motionIntro.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        isDragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
        motionIntro.classList.add('is-dragging');
        if (event.isTrusted) motionIntro.setPointerCapture(event.pointerId);
    });

    motionIntro.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        rotationY += (event.clientX - previousX) * 0.45;
        rotationX -= (event.clientY - previousY) * 0.3;
        previousX = event.clientX;
        previousY = event.clientY;
        renderOrbit();
    });

    function stopDragging() {
        isDragging = false;
        motionIntro.classList.remove('is-dragging');
    }

    motionIntro.addEventListener('pointerup', stopDragging);
    motionIntro.addEventListener('pointercancel', stopDragging);
}
