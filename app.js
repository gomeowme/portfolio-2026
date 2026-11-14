const emailCopyButton = document.getElementById('email-copy-button');
const copyStatus = document.getElementById('copy-status');
const motionIntro = document.querySelector('.motion-intro');
const imageOrbit = document.getElementById('image-orbit');
const introPhotos = [...document.querySelectorAll('.intro-photo')];
const customCursor = document.getElementById('custom-cursor');
let copyStatusTimeout;

function copyTextFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    try {
        textArea.select();
        return document.execCommand('copy');
    } finally {
        textArea.remove();
    }
}

emailCopyButton?.addEventListener('click', async () => {
    const email = emailCopyButton.dataset.email;
    try {
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(email);
            } catch (error) {
                if (!copyTextFallback(email)) throw error;
            }
        } else if (!copyTextFallback(email)) {
            throw new Error('The browser did not copy the email address.');
        }
        clearTimeout(copyStatusTimeout);
        copyStatus.textContent = 'Copied';
        copyStatus.classList.add('is-visible');
        copyStatusTimeout = window.setTimeout(() => {
            copyStatus.classList.remove('is-visible');
        }, 500);
    } catch (error) {
        console.error('Unable to copy the email address.', error);
        clearTimeout(copyStatusTimeout);
        copyStatus.textContent = 'Copy failed';
        copyStatus.classList.add('is-visible');
        copyStatusTimeout = window.setTimeout(() => {
            copyStatus.classList.remove('is-visible');
        }, 500);
    }
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
}

window.addEventListener('hashchange', updatePageView);
updatePageView();

const cvJumpLink = document.querySelector('.cv-jump-link');
cvJumpLink?.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById('cv');
    if (!target) return;

    window.history.pushState(null, '', '#cv');
    const top = target.getBoundingClientRect().top + window.scrollY - 52;
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

        const nextHeaderItem = event.target.closest('.site-header a, .email-copy-button');
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
    let dragMoved = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let previousX = 0;
    let previousY = 0;
    let hasPointerCapture = false;
    let rotationX = -8;
    let rotationY = -12;
    let previousFrameTime = 0;
    let snapTarget = null;
    let expandedPhoto = null;
    let photoFocus = null;
    let isHoveringPhoto = false;
    let carouselSpacing = 190;
    const isInterestOrbit = motionIntro.classList.contains('about-interests');
    const carouselStep = 45;
    const isHomeCarousel = !isInterestOrbit;

    function layoutPhotos() {
        if (isInterestOrbit) {
            const orbitRadius = Math.min(motionIntro.clientWidth * 0.235, motionIntro.clientHeight * 0.43, 260);
            introPhotos.forEach((photo) => {
                const angle = Number(photo.dataset.angle);
                const radius = orbitRadius * Number(photo.dataset.radius);
                photo.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
            });
            return;
        }

        imageOrbit.style.transform = 'translate(-50%, -50%)';
        carouselSpacing = Math.max(190, ...introPhotos.map((photo) => photo.offsetWidth * 1.1));
        renderCarousel();
    }

    function getCarouselDistance(index) {
        const position = rotationY / carouselStep;
        const count = introPhotos.length;
        return ((index - position + count / 2) % count + count) % count - count / 2;
    }

    function renderCarousel() {
        introPhotos.forEach((photo, index) => {
            const distance = getCarouselDistance(index);
            const absoluteDistance = Math.abs(distance);
            const scale = Math.max(0.32, 1.08 - absoluteDistance * 0.24);
            const depth = Math.max(0, 1 - absoluteDistance / 4);
            photo.style.transform = `translate(-50%, -50%) translate3d(${distance * carouselSpacing}px, 0, ${depth * 60}px) rotateY(${-distance * 15}deg) scale(${scale})`;
            photo.style.opacity = String(Math.max(0, 1 - absoluteDistance * 0.34));
            photo.style.pointerEvents = absoluteDistance < 2.5 ? 'auto' : 'none';
            photo.style.zIndex = String(100 - Math.round(absoluteDistance * 10));
        });
    }

    layoutPhotos();
    if (isInterestOrbit || isHomeCarousel) window.addEventListener('resize', layoutPhotos);

    function renderOrbit() {
        if (isInterestOrbit) {
            imageOrbit.style.transform = `translate(-50%, -50%) rotate(${rotationY}deg)`;
            return;
        }
        renderCarousel();
    }

    renderOrbit();

    introPhotos.forEach((photo) => {
        photo.addEventListener('pointerenter', () => {
            isHoveringPhoto = true;
        });
        photo.addEventListener('pointerleave', () => {
            isHoveringPhoto = false;
        });
        photo.addEventListener('focus', () => {
            isHoveringPhoto = true;
        });
        photo.addEventListener('blur', () => {
            isHoveringPhoto = false;
        });
    });

    function animateOrbit(timestamp) {
        if (previousFrameTime && !isDragging) {
            const delta = Math.min(timestamp - previousFrameTime, 50);
            if (snapTarget !== null) {
                rotationY += (snapTarget - rotationY) * Math.min(1, delta * 0.012);
                if (Math.abs(snapTarget - rotationY) < 0.04) {
                    rotationY = snapTarget;
                    snapTarget = null;
                }
                renderOrbit();
            } else if (!isHoveringPhoto) {
                rotationY += delta * (isHomeCarousel ? 0.008 : 0.003);
                renderOrbit();
            }
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
        dragMoved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        previousX = event.clientX;
        previousY = event.clientY;
        hasPointerCapture = false;
        motionIntro.classList.add('is-dragging');
    });

    motionIntro.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 4) {
            dragMoved = true;
            if (event.isTrusted && !hasPointerCapture) {
                motionIntro.setPointerCapture(event.pointerId);
                hasPointerCapture = true;
            }
        }
        rotationY += (event.clientX - previousX) * (isHomeCarousel ? -0.25 : 0.45);
        if (isInterestOrbit) rotationX -= (event.clientY - previousY) * 0.3;
        previousX = event.clientX;
        previousY = event.clientY;
        renderOrbit();
    });

    function stopDragging() {
        isDragging = false;
        hasPointerCapture = false;
        motionIntro.classList.remove('is-dragging');
        if (isHomeCarousel) {
            snapTarget = Math.round(rotationY / carouselStep) * carouselStep;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                rotationY = snapTarget;
                snapTarget = null;
                renderCarousel();
            }
        }
    }

    motionIntro.addEventListener('pointerup', stopDragging);
    motionIntro.addEventListener('pointercancel', stopDragging);

    function setExpandedPhoto(photo) {
        const previousPhoto = expandedPhoto;
        previousPhoto?.classList.remove('is-expanded');
        previousPhoto?.setAttribute('aria-expanded', 'false');
        photoFocus?.remove();
        photoFocus = null;
        expandedPhoto = photo;
        if (expandedPhoto) {
            expandedPhoto.classList.add('is-expanded');
            expandedPhoto.setAttribute('aria-expanded', 'true');

            const face = expandedPhoto.querySelector('.photo-face').cloneNode(true);
            const focusButton = document.createElement('button');
            focusButton.className = 'photo-focus-card';
            focusButton.type = 'button';
            focusButton.setAttribute('aria-label', '확대된 사진 닫기');
            focusButton.style.width = `${expandedPhoto.offsetWidth}px`;
            focusButton.style.height = `${expandedPhoto.offsetHeight}px`;
            const focusScale = Math.min(
                1.7,
                (window.innerWidth * 0.82) / expandedPhoto.offsetWidth,
                (window.innerHeight * 0.78) / expandedPhoto.offsetHeight
            );
            focusButton.style.setProperty('--focus-scale', String(focusScale));
            focusButton.appendChild(face);

            photoFocus = document.createElement('div');
            photoFocus.className = 'photo-focus';
            photoFocus.setAttribute('role', 'dialog');
            photoFocus.setAttribute('aria-modal', 'true');
            photoFocus.setAttribute('aria-label', expandedPhoto.getAttribute('aria-label'));
            photoFocus.appendChild(focusButton);
            photoFocus.addEventListener('click', (event) => {
                if (event.target === photoFocus) setExpandedPhoto(null);
            });
            photoFocus.addEventListener('keydown', (event) => {
                if (event.key === 'Tab') {
                    event.preventDefault();
                    focusButton.focus();
                }
            });
            focusButton.addEventListener('click', () => setExpandedPhoto(null));
            document.body.appendChild(photoFocus);
            focusButton.focus({ preventScroll: true });
        } else {
            previousPhoto?.focus({ preventScroll: true });
        }
    }

    motionIntro.addEventListener('click', (event) => {
        const photo = event.target.closest('.intro-photo');
        if (dragMoved) {
            dragMoved = false;
            return;
        }

        if (!photo) {
            setExpandedPhoto(null);
            return;
        }

        if (isHomeCarousel) {
            const distance = getCarouselDistance(introPhotos.indexOf(photo));
            if (Math.abs(distance) > 0.18) {
                snapTarget = rotationY + distance * carouselStep;
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    rotationY = snapTarget;
                    snapTarget = null;
                    renderCarousel();
                }
                return;
            }
        }

        setExpandedPhoto(expandedPhoto === photo ? null : photo);
    });

    introPhotos.forEach((photo) => {
        photo.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            photo.click();
        });
    });

    document.addEventListener('click', (event) => {
        if (expandedPhoto && !motionIntro.contains(event.target) && !photoFocus?.contains(event.target)) {
            setExpandedPhoto(null);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setExpandedPhoto(null);
    });
}
