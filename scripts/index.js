
const setupDrawer = () => {
    const openMenuBtn = document.getElementById('open-menu');
    const drawerBlock = document.querySelector('.drawer-block');
    const closeMenuBtn = document.getElementById('close-menu');
    const body = document.body;

    if (!openMenuBtn || !drawerBlock || !closeMenuBtn) {
        return;
    }

    openMenuBtn.addEventListener('click', () => {
        drawerBlock.classList.toggle('active');
        body.classList.toggle('overflow-hidden');
    });

    closeMenuBtn.addEventListener('click', () => {
        drawerBlock.classList.remove('active');
        body.classList.remove('overflow-hidden');
    });
};

const setupAnimationButtons = () => {
    const buttons = document.querySelectorAll('.animation-button');

    if (!buttons.length) {
        return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const updatePosition = (button, event) => {
        const rect = button.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        button.style.setProperty('--animation-button-pos-x', `${relativeX * 100}%`);
        button.style.setProperty('--animation-button-pos-y', `${relativeY * 100}%`);
    };

    const startTracking = (button, event, handler) => {
        button.classList.add('is-pointer-tracking');
        button.addEventListener('pointermove', handler);
        updatePosition(button, event);
    };

    const stopTracking = (button, handler) => {
        button.classList.remove('is-pointer-tracking');
        button.removeEventListener('pointermove', handler);
        button.style.removeProperty('--animation-button-pos-x');
        button.style.removeProperty('--animation-button-pos-y');
    };

    buttons.forEach((button) => {
        const handlePointerMove = (event) => updatePosition(button, event);

        button.addEventListener('pointerenter', (event) => {
            startTracking(button, event, handlePointerMove);
        });

        button.addEventListener('pointerleave', () => {
            stopTracking(button, handlePointerMove);
        });

        button.addEventListener('pointercancel', () => {
            stopTracking(button, handlePointerMove);
        });
    });
};

const setupPromptComposer = () => {
    const surface = document.querySelector('.prompt-composer__surface');
    if (!surface) {
        return;
    }

    if (surface.dataset.composerInitialized === 'true') {
        return;
    }

    const tokenElements = Array.from(surface.querySelectorAll('.prompt-token'));
    const shuffleBtn = surface.querySelector('[data-action="shuffle"]');
    const openBtn = surface.querySelector('[data-action="open"]');
    const textarea = surface.querySelector('#prompt-composer-textarea');

    if (!tokenElements.length || !textarea) {
        return;
    }

    const tokensByKey = tokenElements.reduce((acc, tokenEl) => {
        const key = tokenEl.dataset.token;
        const button = tokenEl.querySelector('.prompt-token__label');
        const menu = tokenEl.querySelector('.prompt-token__menu');
        const options = Array.from(tokenEl.querySelectorAll('.prompt-token__option'));
        const labelText = button?.querySelector('.prompt-token__label-text') || button;

        if (!key || !button || !menu || options.length === 0) {
            return acc;
        }

        let activeOption = options.find((option) => option.classList.contains('is-active')) || options[0];
        const value = activeOption.dataset.value || activeOption.textContent.trim();

        options.forEach((option) => {
            const isActive = option === activeOption;
            option.classList.toggle('is-active', isActive);
            option.setAttribute('aria-selected', String(isActive));
        });

        labelText.textContent = value;
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-haspopup', 'listbox');

        acc[key] = {
            key,
            token: tokenEl,
            button,
            menu,
            options,
            labelText,
            value,
            activeOption,
        };

        return acc;
    }, {});

    const requiredKeys = ['verb', 'subject', 'trigger'];
    const hasAllKeys = requiredKeys.every((key) => tokensByKey[key]);
    if (!hasAllKeys) {
        return;
    }

    let customPrompt = '';
    let customPromptDirty = false;

    const composePrompt = () => {
        const role = tokensByKey.verb.value;
        const focus = tokensByKey.subject.value;
        const timeframe = tokensByKey.trigger.value;

        return `As a ${role}, I want to identify the ${focus} in the last ${timeframe} for my hospitality company.`;
    };

    const updateTextareaIfPristine = () => {
        if (!customPromptDirty) {
            customPrompt = composePrompt();
            textarea.value = customPrompt;
        }
    };

    const closeMenu = (state) => {
        state.token.classList.remove('is-open');
        state.button.setAttribute('aria-expanded', 'false');
    };

    const closeAllMenus = () => {
        Object.values(tokensByKey).forEach((state) => closeMenu(state));
    };

    const openMenu = (state) => {
        closeAllMenus();
        state.token.classList.add('is-open');
        state.button.setAttribute('aria-expanded', 'true');
        window.requestAnimationFrame(() => {
            const focusTarget = state.activeOption || state.options[0];
            if (focusTarget) {
                focusTarget.focus({ preventScroll: true });
            }
        });
    };

    const toggleMenu = (state) => {
        if (state.token.classList.contains('is-open')) {
            closeMenu(state);
        } else {
            openMenu(state);
        }
    };

    const selectOption = (state, option, { shouldUpdate = true, close = true, focusTrigger = true } = {}) => {
        state.options.forEach((opt) => {
            const isActive = opt === option;
            opt.classList.toggle('is-active', isActive);
            opt.setAttribute('aria-selected', String(isActive));
        });

        state.value = option.dataset.value || option.textContent.trim();
        state.labelText.textContent = state.value;
        state.activeOption = option;

        if (close) {
            closeMenu(state);
        }

        if (focusTrigger) {
            state.button.focus({ preventScroll: true });
        }

        if (shouldUpdate) {
            updateTextareaIfPristine();
        }
    };

    Object.values(tokensByKey).forEach((state) => {
        state.button.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu(state);
        });

        state.button.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMenu(state);
            }
        });

        state.options.forEach((option) => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                selectOption(state, option);
            });

            option.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectOption(state, option);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    closeMenu(state);
                    state.button.focus({ preventScroll: true });
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const currentIndex = state.options.indexOf(option);
                    const nextIndex = event.key === 'ArrowDown'
                        ? (currentIndex + 1) % state.options.length
                        : (currentIndex - 1 + state.options.length) % state.options.length;
                    state.options[nextIndex].focus({ preventScroll: true });
                }
            });
        });
    });

    const handleDocumentClick = (event) => {
        if (!surface.contains(event.target)) {
            closeAllMenus();
        }
    };

    const handleEscapeKey = (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        const openState = Object.values(tokensByKey).find((state) => state.token.classList.contains('is-open'));
        if (!openState) {
            return;
        }

        closeAllMenus();
        openState.button.focus({ preventScroll: true });
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);

    const randomizeTokens = () => {
        closeAllMenus();

        Object.values(tokensByKey).forEach((state) => {
            const options = state.options;
            if (options.length <= 1) {
                return;
            }

            const currentIndex = options.indexOf(state.activeOption);
            let nextIndex = Math.floor(Math.random() * options.length);

            if (options.length > 1 && nextIndex === currentIndex) {
                nextIndex = (currentIndex + 1) % options.length;
            }

            selectOption(state, options[nextIndex], { shouldUpdate: false, close: false, focusTrigger: false });
        });

        updateTextareaIfPristine();
    };

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', randomizeTokens);
    }

    if (openBtn) {
        const date = new Date();
        openBtn.addEventListener('click', () => {
            window.open(`https://calendly.com/marine-pescot/book-a-call?month=${date.getFullYear()}-${date.getMonth() + 1}`, '_blank', 'noopener,noreferrer');
        });
    }

    textarea.addEventListener('input', () => {
        customPrompt = textarea.value;
        customPromptDirty = textarea.value.trim().length > 0;
    });

    updateTextareaIfPristine();
    surface.dataset.composerInitialized = 'true';
};

const counter = () => {
    const counterElement = document.querySelector('.invoices-count .counter');
    let count = 198_000_000;
    let totalCount = 200_070_789;
    
    if (!counterElement) {
        return;
    }
    const updateCounter = () => {
        if (count >= totalCount) {
            clearInterval(countInterval);
            return;
        }
        count += Math.floor(Math.random() * 5) + 10000; // Increment by a random number between 1 and 5
        counterElement.textContent = new Intl.NumberFormat("en-EN", { style: "currency", currency: "EUR" }).format(
            count, 
        ).replace('€', '').trim().replace('.00', '');
    };

    const countInterval = setInterval(updateCounter, 10); // Update every 10 milliseconds
};

let dynamicTextInterval;

const updateDynamicText = () => {
    const dynamicTextElement = document.querySelector('.dynamic-text');
    const texts = ['time', 'hassle', 'costs'];

    if (!dynamicTextElement || texts.length === 0) {
        return;
    }

    let index = 0;
    // dynamicTextElement.textContent = texts[index]; // Causing error on first display
    dynamicTextElement.classList.add('chroma-text');
    dynamicTextElement.classList.add('chroma-text-animate');

    const restartAnimation = () => {
        dynamicTextElement.classList.remove('chroma-text-animate');
        // Force reflow so CSS animation can restart.
        void dynamicTextElement.offsetWidth;
        dynamicTextElement.classList.add('chroma-text-animate');
    };

    dynamicTextInterval = window.setInterval(() => {
        index = (index + 1) % texts.length;
        new Typewriter('.chroma-text-animate', {
            strings: [texts[index]],
            autoStart: true,
        });
        restartAnimation();
    }, 3000);
};

const initVideoBackgrounds = () => {
    const videoContainers = document.querySelectorAll('.motion-animation-video');
    const videosFiles =  [
        // '/assets/videos/85590-590014592.mp4',
        // '/assets/videos/87789-602074264.mp4',
        // '/assets/videos/104629-667563131.mp4',
        // '/assets/videos/131974-751915250.mp4',
        '/assets/videos/87787-602074236.mp4'
    ]
    videoContainers.forEach((container) => {
        const video = container.querySelector('video');
        if (video) {
            console.log(Math.floor(Math.random() * videosFiles.length));
            video.src =  videosFiles[Math.floor(Math.random() * videosFiles.length)];
            video.play().catch((error) => {
                console.error('Error playing video background:', error);
            });
        }
    });
}

const scrollDirectionDetector = () => {
    let lastScrollTop = 0;
    return () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        const direction = (st > lastScrollTop) ? 'down' : 'up';
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
        return direction;
    };
};

const playVideo = () => {
    document.querySelector('.motion-animation-video video').play();
};

const addAnimationOnView = (entry) => {

    if (entry.classList.contains('sm:justify-end')) {
        entry.classList.add('slide-from-right');
    } else {
        entry.classList.add('slide-from-left');
    }
    const label = entry.querySelector('.label span');
    label.classList.add('chroma-text', 'chroma-text-animate');
};

const addAnimationOnSponsors = (entry) => {
    if (!entry.classList.contains('appears-from-bottom')) {
        entry.classList.add('appears-from-bottom');
    }
}

const initTestimonialsSlider = () => {
    const sliderEl = document.querySelector('.testimonials__slider');

    if (!sliderEl || typeof window.Swiper === 'undefined') {
        return;
    }

    if (sliderEl.dataset.sliderInitialized === 'true') {
        return;
    }

    const paginationEl = sliderEl.querySelector('.testimonials__pagination');
    const nextButton = sliderEl.querySelector('.testimonials__nav--next');
    const prevButton = sliderEl.querySelector('.testimonials__nav--prev');

    const swiperConfig = {
        loop: true,
        speed: 600,
        grabCursor: true,
        centeredSlides: false,
        watchSlidesProgress: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        slidesPerView: 1.05,
        spaceBetween: 16,
        breakpoints: {
            480: {
                slidesPerView: 1.2,
                spaceBetween: 20,
            },
            640: {
                slidesPerView: 1.5,
                spaceBetween: 24,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 28,
            },
            1024: {
                slidesPerView: 2.5,
                spaceBetween: 32,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 32,
            },
        },
        a11y: {
            prevSlideMessage: 'Previous testimonial',
            nextSlideMessage: 'Next testimonial',
            firstSlideMessage: 'This is the first testimonial',
            lastSlideMessage: 'This is the last testimonial',
            slideLabelMessage: 'Testimonial {{index}} of {{slidesLength}}',
        },
    };

    if (paginationEl) {
        swiperConfig.pagination = {
            el: paginationEl,
            clickable: true,
        };
    }

    if (nextButton && prevButton) {
        swiperConfig.navigation = {
            nextEl: nextButton,
            prevEl: prevButton,
        };
    }

    new window.Swiper(sliderEl, swiperConfig);
    sliderEl.dataset.sliderInitialized = 'true';
};

const main = () => {
    initVideoBackgrounds();
    playVideo();
    setupPromptComposer();
    setupDrawer();
    setupAnimationButtons();
    initTestimonialsSlider();
    tippy('[data-tippy-content]');

    document.querySelectorAll('.ask-demo').forEach(element => {
        element.addEventListener('click', () => {
            window.open('https://calendly.com/marine-pescot/book-a-call', '_blank');
        });
    })

    const onIntersection = (entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                counter();
            }

            if (entry.isVisible && entry.target.classList.contains('our-identity--item')) {
                addAnimationOnView(entry.target);
            }

            if (entry.isVisible && entry.target.classList.contains('sponsors')) {
                addAnimationOnSponsors(entry.target);
            }
        }
    };

    const observer = new IntersectionObserver(onIntersection, { trackVisibility: true, delay: 100});
    
    window.setTimeout(() => {
        updateDynamicText();
        observer.observe(document.querySelector(".invoices-count"));
        observer.observe(document.querySelector(".mobile-menu"));
        observer.observe(document.querySelector(".sponsors"));
        document.querySelectorAll(".our-identity--item").forEach(selector => {
            observer.observe(selector);
        })
    }, 800);
};

document.addEventListener('DOMContentLoaded', main);
