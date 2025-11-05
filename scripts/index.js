
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
    const header = document.querySelector('header');
    if (!header) {
        return;
    }

    const detectScrollDirection = scrollDirectionDetector();

    window.addEventListener('scroll', () => {
        const direction = detectScrollDirection();
        console.log(window.scrollY, direction);
        if (direction === 'down') {
            header.classList.remove('is-sticky');
            header.classList.add('animation-slide-out');
            header.classList.remove('animation-slide-in');
        } else if (direction === 'up' && window.scrollY > header.getBoundingClientRect().height * 2) {
            header.classList.add('is-sticky');
            header.classList.add('animation-slide-in');
            header.classList.remove('animation-slide-out');
        } else {
            header.classList.remove('animation-slide-in');
            header.classList.add('animation-slide-out');
            header.classList.remove('is-sticky');
        }
    });
}

const main = () => {
    // initVideoBackgrounds();
    stickHeaderOnScroll();
    setupDrawer();
    setupPromptComposer();
    updateDynamicText();

    const onIntersection = (entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                counter();
            }
        }
    };

    const observer = new IntersectionObserver(onIntersection);
    observer.observe(document.querySelector(".invoices-count"));
};

document.addEventListener('DOMContentLoaded', main);
