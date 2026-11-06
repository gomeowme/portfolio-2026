const menuButton = document.getElementById('menu-button');
const menuPanel = document.getElementById('menu-panel');
const motionIntro = document.querySelector('.motion-intro');
const imageOrbit = document.getElementById('image-orbit');
const introPhotos = [...document.querySelectorAll('.intro-photo')];

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

function updatePageView() {
    const isHome = window.location.hash === '' || window.location.hash === '#home';
    document.body.classList.toggle('home-view', isHome);
    document.body.classList.toggle('project-view', !isHome);

    document.querySelectorAll('.site-nav a').forEach((link) => {
        const isCurrent = link.hash === (isHome ? '#home' : window.location.hash);
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    if (!isHome) {
        requestAnimationFrame(() => {
            const target = document.getElementById(window.location.hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    } else {
        window.scrollTo(0, 0);
    }

    closeMenu();
}

window.addEventListener('hashchange', updatePageView);
updatePageView();

if (motionIntro && imageOrbit && introPhotos.length > 0) {
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let rotationX = -8;
    let rotationY = -12;

    introPhotos.forEach((photo) => {
        photo.style.transform = `translate(-50%, -50%) rotateY(${Number(photo.dataset.angle)}deg) translateZ(390px)`;
    });

    function renderOrbit() {
        imageOrbit.style.transform = `translate(-50%, -50%) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
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
