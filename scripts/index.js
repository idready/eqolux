
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

const setupPromptComposer = () => {
    const surface = document.querySelector('.prompt-composer__surface');
    if (!surface) {
        return;
    }

    const tokenSelects = Array.from(surface.querySelectorAll('.prompt-token__label'));
    const shuffleBtn = surface.querySelector('[data-action="shuffle"]');
    const openBtn = surface.querySelector('[data-action="open"]');
    const textarea = surface.querySelector('#prompt-composer-textarea');

    if (!tokenSelects.length || !textarea) {
        return;
    }

    const selectsByKey = tokenSelects.reduce((map, select) => {
        const key = select.dataset.token;
        if (key) {
            map[key] = select;
        }
        return map;
    }, {});

    const requiredKeys = ['verb', 'subject', 'trigger'];
    const hasAllKeys = requiredKeys.every((key) => selectsByKey[key]);
    if (!hasAllKeys) {
        return;
    }

    const composePrompt = () => {
        return [
            'Build me a workflow that',
            selectsByKey.verb.value,
            `${selectsByKey.subject.value},`,
            'detects when',
            selectsByKey.trigger.value,
        ].join(' ').replace(/\s+,/g, ',');
    };

    let customPrompt = '';
    let customPromptDirty = false;

    const updateTextareaIfPristine = () => {
        if (!customPromptDirty) {
            customPrompt = composePrompt();
            textarea.value = customPrompt;
        }
    };

    const randomizeTokens = () => {
        requiredKeys.forEach((key) => {
            const select = selectsByKey[key];
            const optionCount = select.options.length;
            if (optionCount <= 1) {
                return;
            }

            const currentIndex = select.selectedIndex;
            let nextIndex = Math.floor(Math.random() * optionCount);

            if (optionCount > 1 && nextIndex === currentIndex) {
                nextIndex = (currentIndex + 1) % optionCount;
            }

            select.selectedIndex = nextIndex;
        });

        updateTextareaIfPristine();
    };

    tokenSelects.forEach((select) => {
        select.addEventListener('change', () => {
            updateTextareaIfPristine();
        });
    });

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
    dynamicTextElement.textContent = texts[index];
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
        // Version with Typewriter effect (commented out)
        new Typewriter('.chroma-text-animate', {
            strings: [texts[index]],
            autoStart: true,
        });
        // dynamicTextElement.textContent = texts[index];
        restartAnimation();
    }, 3000);
};

const initVideoBackgrounds = () => {
    const videoContainers = document.querySelectorAll('.motion-animation-video');
    const videosFiles =  [
        '/assets/videos/85590-590014592.mp4',
        '/assets/videos/87789-602074264.mp4',
        '/assets/videos/104629-667563131.mp4'
    ]
    videoContainers.forEach((container) => {
        const video = container.querySelector('video');
        if (video) {
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

const stickHeaderOnScroll = () => {
    const header = document.querySelector('.hero-block header');
    if (!header) {
        return;
    }

    let stickyThreshold = header.offsetHeight * 2;
    let lastKnownScroll = window.scrollY || 0;
    let ticking = false;
    let isSticky = false;

    const updateState = () => {
        const currentScroll = window.scrollY || window.pageYOffset;
        const delta = currentScroll - lastKnownScroll;
        let direction = null;

        if (Math.abs(delta) > 4) {
            direction = delta > 0 ? 'down' : 'up';
        }

        lastKnownScroll = currentScroll;

        if (currentScroll > stickyThreshold) {
            if (!isSticky) {
                header.classList.add('is-sticky');
                header.classList.remove('is-visible');
                isSticky = true;
            }

            if (direction === 'up') {
                header.classList.add('is-visible');
            } else if (direction === 'down') {
                header.classList.remove('is-visible');
            }
        } else if (isSticky) {
            header.classList.remove('is-sticky', 'is-visible');
            isSticky = false;
        }

        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateState);
            ticking = true;
        }
    };

    const onResize = () => {
        stickyThreshold = header.offsetHeight * 2;
        updateState();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    updateState();
};

const playVideo = () => {
    document.querySelector('.motion-animation-video video').play();
};

const main = () => {
    // initVideoBackgrounds();
    playVideo();
    stickHeaderOnScroll();
    setupPromptComposer();
    setupDrawer();
    // updateDynamicText();

    const onIntersection = (entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                counter();
            }
        }
    };

    const observer = new IntersectionObserver(onIntersection);
    // observer.observe(document.querySelector(".invoices-count"));
    
    window.setTimeout(() => {
        updateDynamicText();
        observer.observe(document.querySelector(".invoices-count"));
    }, 800);
};

document.addEventListener('DOMContentLoaded', main);
