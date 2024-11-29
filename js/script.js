document.addEventListener('DOMContentLoaded', () => {
    // Utility: Debounce function with requestAnimationFrame
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => requestAnimationFrame(() => func.apply(this, args)), wait);
        };
    }

    // Utility: Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                requestAnimationFrame(() => inThrottle = false);
            }
        }
    }

    // Initialize Intersection Observer for lazy loading
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.dataset.src) {
                    target.src = target.dataset.src;
                    delete target.dataset.src;
                }
                target.classList.add('visible');
                observer.unobserve(target);
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const lazyLoadObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Lazy load images
    document.querySelectorAll('img[data-src]').forEach(img => lazyLoadObserver.observe(img));

    // FAQ Interaction with keyboard support
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const content = item.querySelector('.faq-content');

        if (header && content) {
            header.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');

            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                header.setAttribute('aria-expanded', !isExpanded);
                content.setAttribute('aria-hidden', isExpanded);
                item.classList.toggle('active');

                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        const otherHeader = otherItem.querySelector('.faq-header');
                        const otherContent = otherItem.querySelector('.faq-content');
                        otherHeader?.setAttribute('aria-expanded', 'false');
                        otherContent?.setAttribute('aria-hidden', 'true');
                        otherItem.classList.remove('active');
                    }
                });
            });

            // Keyboard navigation
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        }
    });

    // Smooth scroll with performance optimization
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;

            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition - headerOffset + window.scrollY;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Optimized header scroll handling
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        const scrollThreshold = 50;

        const handleScroll = throttle(() => {
            const currentScroll = window.scrollY;
            
            if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;

            if (currentScroll > lastScroll && currentScroll > 100) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }

            if (currentScroll > 50) {
                header.classList.add('header-shadow');
            } else {
                header.classList.remove('header-shadow');
            }

            lastScroll = currentScroll;
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Image slider with touch support and automatic rotation
    function setupImageSlider() {
        const slider = document.querySelector('.image-slider');
        const dots = document.querySelectorAll('.dot');
        if (!slider || !dots.length) return;

        let currentSlide = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        let autoPlayInterval;
        const autoPlayDelay = 5000; // 5 seconds

        function updateSlide(index) {
            const slides = slider.querySelectorAll('.slider-image');
            if (!slides.length) return;

            currentSlide = (index + slides.length) % slides.length;
            
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentSlide);
                dots[i].classList.toggle('active', i === currentSlide);
                dots[i].setAttribute('aria-selected', i === currentSlide);
            });
        }

        function nextSlide() {
            const slides = slider.querySelectorAll('.slider-image');
            updateSlide(currentSlide + 1);
        }

        function previousSlide() {
            const slides = slider.querySelectorAll('.slider-image');
            updateSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Touch events with performance optimization
        slider.addEventListener('touchstart', (e) => {
            stopAutoPlay();
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
            startAutoPlay();
        }, { passive: true });

        // Mouse events
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateSlide(index);
                stopAutoPlay();
                startAutoPlay();
            });

            // Keyboard navigation for dots
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateSlide(index);
                    stopAutoPlay();
                    startAutoPlay();
                }
            });
        });

        // Keyboard navigation
        slider.setAttribute('tabindex', '0');
        slider.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSlide();
                    stopAutoPlay();
                    startAutoPlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    stopAutoPlay();
                    startAutoPlay();
                    break;
            }
        });

        // Initialize
        updateSlide(0);
        startAutoPlay();
    }

    setupImageSlider();

    // Theme Toggle
    function initTheme() {
        const themeToggle = document.querySelector('.theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 设置初始主题
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }

        // 检查本地存储中的主题设置
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            setTheme(currentTheme);
        } else {
            // 如果没有存储的主题，默认使用亮色主题
            setTheme('light');
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        // 监听系统主题变化
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    initTheme();

    // Add page load complete marker
    requestAnimationFrame(() => document.body.classList.add('loaded'));
});
