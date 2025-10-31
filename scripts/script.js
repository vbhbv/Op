document.addEventListener('DOMContentLoaded', () => {
    // ⚙️ العناصر الأساسية (Cached Selectors)
    const body = document.body;
    const toggleButton = document.getElementById('mode-toggle');
    const searchButton = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const scholarCardsContainer = document.getElementById('scholar-cards-container');
    const backToTopButton = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('nav a');
    const header = document.querySelector('header'); 
    const filterSelect = document.getElementById('era-filter'); 
    const clearSearchButton = document.getElementById('clear-search-btn');
    const loadingMessageElement = document.getElementById('loading-message'); // الميزة 31

    let allScholarsData = []; 
    const SCROLLED_CLASS = 'scrolled'; 
    const DATA_CACHE_KEY = 'archiveDataCache'; // الميزة 33
    const CACHE_DURATION = 3600000; // الميزة 33: ساعة واحدة بالمللي ثانية

    // =============================================================
    // I. تحسينات الوضع الليلي/النهاري
    // =============================================================

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedMode = localStorage.getItem('mode') || (prefersDark.matches ? 'dark-mode' : 'light-mode');

    function toggleMode(newMode = null) {
        body.classList.add('mode-transition'); 
        const currentMode = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        const finalMode = newMode || (currentMode === 'light-mode' ? 'dark-mode' : 'light-mode');
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(finalMode);
        localStorage.setItem('mode', finalMode);
        updateModeIcon(finalMode);
        setTimeout(() => body.classList.remove('mode-transition'), 300); 
    }

    function updateModeIcon(currentMode) {
        if (toggleButton) {
             toggleButton.innerHTML = (currentMode === 'dark-mode') ? 
                 '<i class="fas fa-sun" title="الوضع النهاري"></i>' : 
                 '<i class="fas fa-moon" title="الوضع الليلي"></i>';
        }
    }

    body.classList.add(savedMode);
    updateModeIcon(savedMode);
    if (toggleButton) {
        toggleButton.addEventListener('click', () => toggleMode());
    }
    
    // =============================================================
    // II. تحسينات وظائف البحث والتصفية
    // =============================================================
    
    // الميزة 32: دالة التصفية الموحدة مع تقنية Debounce 
    const debouncedFiltering = debounce(applyFiltering, 300); 

    function applyFiltering() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedEra = filterSelect ? filterSelect.value : 'all'; 

        if (clearSearchButton) {
            clearSearchButton.style.display = searchTerm ? 'block' : 'none';
        }

        const filteredScholars = allScholarsData.filter(scholar => {
            const matchesSearch = scholar.name.toLowerCase().includes(searchTerm) ||
                                  scholar.bio_snippet.toLowerCase().includes(searchTerm) ||
                                  scholar.era.toLowerCase().includes(searchTerm);
                                  
            const matchesEra = selectedEra === 'all' || scholar.era === selectedEra;
            
            return matchesSearch && matchesEra;
        });
        
        if (filteredScholars.length === 0) {
             displayNoResults(scholarCardsContainer);
        } else {
             displayScholarCards(filteredScholars, scholarCardsContainer);
        }
    }

    if (searchInput) {
        // استخدام دالة Debounce بدلاً من الاستماع المباشر لـ 'input'
        searchInput.addEventListener('input', debouncedFiltering);
    }
    
    // =============================================================
    // III. تحسينات تحميل وعرض البيانات
    // =============================================================
    
    function createScholarCard(scholar) {
        const card = document.createElement('a');
        // الميزة 34: إضافة أداة Tooltip على البطاقة
        card.setAttribute('title', `انقر لعرض صفحة ${scholar.name}`);
        card.href = `pages/${scholar.id}.html`; 
        card.setAttribute('data-era', scholar.era.replace(/\s+/g, '-')); 
        card.classList.add('scholar-card');
        
        card.addEventListener('mouseover', () => card.classList.add('hover-shake'));
        card.addEventListener('animationend', () => card.classList.remove('hover-shake'));

        const iconHtml = scholar.featured ? 
            '<span class="featured-badge" title="شخصية مميزة"><i class="fas fa-star"></i></span>' : '';
        
        card.innerHTML = `
            <div class="scholar-image-wrapper">
                <img src="../Images/${scholar.image}" alt="صورة ${scholar.name}" class="scholar-image" loading="lazy" onerror="this.onerror=null; this.src='../Images/placeholder.webp';"> </div>
            <div class="scholar-info">
                ${iconHtml}
                <h4 class="scholar-name">${scholar.name}</h4>
                <p class="scholar-bio-snippet">${scholar.bio_snippet}</p>
                <span class="era-tag">${scholar.era}</span>
            </div>
        `;
        return card;
    }

    function displayScholarCards(scholars, container) {
        if (container) {
            container.innerHTML = ''; 
            const fragment = document.createDocumentFragment();
            
            scholars.forEach(scholar => {
                fragment.appendChild(createScholarCard(scholar));
            });
            
            container.appendChild(fragment);
            observeNewCards();
            
            // الميزة 36: تحديث عدد النتائج
            updateResultCount(scholars.length);
        }
    }
    
    function updateResultCount(count) {
        const countElement = document.getElementById('results-count'); // يجب وجود هذا العنصر في HTML
        if (countElement) {
            countElement.textContent = `عرض ${count} من أصل ${allScholarsData.length} شخصية`;
            countElement.style.display = 'block';
        }
    }
    
    // الميزة 31: دالة لتحديث حالة التحميل
    function setLoadingState(isLoading, message = 'جارِ تحميل البيانات...') {
        if (loadingMessageElement) {
            loadingMessageElement.innerHTML = isLoading ? `<div class="loader-spinner"></div><p>${message}</p>` : '';
            loadingMessageElement.style.display = isLoading ? 'flex' : 'none';
        }
        if (scholarCardsContainer) {
            scholarCardsContainer.style.display = isLoading ? 'none' : 'grid';
        }
    }


    async function loadArchiveData() {
        if (!scholarCardsContainer) return;
        
        setLoadingState(true); // الميزة 31: تفعيل حالة التحميل

        // الميزة 33: محاولة استعادة البيانات من الذاكرة المؤقتة (LocalStorage)
        const cachedData = localStorage.getItem(DATA_CACHE_KEY);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('تم تحميل البيانات من الذاكرة المؤقتة.');
                processData(data);
                setLoadingState(false);
                return;
            } else {
                console.log('الذاكرة المؤقتة منتهية الصلاحية. جلب جديد...');
                localStorage.removeItem(DATA_CACHE_KEY);
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('../data/archive.json', { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('فشل في تحميل ملف البيانات.');
            }
            const data = await response.json();
            
            // الميزة 33: تخزين البيانات و الطابع الزمني في الذاكرة المؤقتة
            localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));

            processData(data);

        } catch (error) {
            console.error('خطأ في معالجة بيانات الأرشيف:', error);
            setLoadingState(false, 'تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى.');
             if (scholarCardsContainer) {
                 scholarCardsContainer.innerHTML = '<p class="error-message">تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى.</p>';
            }
        } finally {
            setLoadingState(false);
        }
    }

    function processData(data) {
        let dataToDisplay = [];
        const uniqueEras = new Set(); 

        if (document.body.id === 'arab-writers-page') {
            dataToDisplay = data.arabWriters || [];
            dataToDisplay.forEach(scholar => uniqueEras.add(scholar.era));
        } 

        // الميزة 37: فرز البيانات أبجدياً حسب الاسم افتراضياً
        dataToDisplay.sort((a, b) => a.name.localeCompare(b.name)); 

        allScholarsData = dataToDisplay; 
        displayScholarCards(allScholarsData, scholarCardsContainer);
        populateEraFilter(uniqueEras);
    }
    

    if (document.body.id && document.body.id.includes('-page')) {
         loadArchiveData(); 
    }

    // =============================================================
    // IV. ميزات جمالية وتقنية إضافية
    // =============================================================
    
    // دالة Debounce (الميزة 32)
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // الميزة 38: إضافة مستمع لأحداث لوحة المفاتيح العالمية (للإغلاق السريع)
    document.addEventListener('keydown', (e) => {
        // إذا ضغط المستخدم على CTRL + K
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault(); // منع سلوك المتصفح الافتراضي
            if (searchBar) {
                // فتح وإغلاق شريط البحث
                searchBar.classList.toggle('is-visible');
                if (searchBar.classList.contains('is-visible')) {
                    searchInput.focus();
                }
            }
        }
        
        // الميزة 39: إغلاق جميع الإشعارات بـ Shift + Escape
        if (e.shiftKey && e.key === 'Escape') {
            const toasts = document.querySelectorAll('#toast-container .toast-notification');
            toasts.forEach(toast => toast.remove());
        }
    });

    // ميزة 40: تتبع النقر على زر التبديل
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
             // يمكن هنا دمج خدمة تحليل (مثل Google Analytics)
             // console.log('Mode Toggled', body.classList.contains('dark-mode') ? 'Dark' : 'Light');
        });
    }

    // ميزات أخرى (تم الاحتفاظ بها)
    // ... التحقق من الاتصال، الرابط النشط، زر العودة للأعلى، Intersection Observer...

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-loaded');
                observer.unobserve(entry.target); 
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    const observeNewCards = () => {
        document.querySelectorAll('.scholar-card').forEach(card => {
            if (!card.classList.contains('is-loaded')) { 
                observer.observe(card);
            }
        });
    };
});
