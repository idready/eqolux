
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

    const requiredKeys = ['verb', 'subject', 'trigger', 'destination'];
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
            'and send it to',
            selectsByKey.destination.value,
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

const main = () => {
    setupDrawer();
    setupPromptComposer();

    const onIntersection = (entries) => {
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
