// دوال الدعم الأساسية: يجب وضع هذه الدوال خارج دالة document.addEventListener

// الميزة 32: دالة Debounce (لتأخير تنفيذ البحث)
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// الميزة 18 & 30: دالة الإشعارات المؤقتة (Toast Notifications)
function showToastNotification(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.classList.add('toast-notification', type);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // إخفاء الإشعار بعد 4 ثوانٍ
    setTimeout(() => {
        toast.classList.add('fade-out');
        // إزالة الإشعار من الـ DOM بعد انتهاء التحول
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
    
    // الميزة 30: إغلاق الإشعار عند النقر عليه
    toast.addEventListener('click', () => toast.remove()); 
}


document.addEventListener('DOMContentLoaded', () => {
    // ⚙️ العناصر الأساسية (Cached Selectors)
    const body = document.body;
    const toggleButton = document.getElementById('mode-toggle');
    const searchButton = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const scholarCardsContainer = document.getElementById('scholar-cards-container');
    const backToTopButton = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('header'); 
    const filterSelect = document.getElementById('era-filter'); 
    const clearSearchButton = document.getElementById('clear-search-btn');
    const loadingMessageElement = document.getElementById('loading-message'); // الميزة 31
    const resultsCountElement = document.getElementById('results-count'); // الميزة 36

    let allScholarsData = []; 
    const DATA_CACHE_KEY = 'archiveDataCache'; // الميزة 33
    const CACHE_DURATION = 3600000; // الميزة 33: ساعة واحدة

    // =============================================================
    // I. تحسينات الوضع الليلي/النهاري (Enhanced Mode Toggle)
    // =============================================================

    // التحقق من تفضيلات النظام للمرة الأولى
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedMode = localStorage.getItem('mode') || (prefersDark.matches ? 'dark-mode' : 'light-mode');

    function toggleMode(newMode = null) {
        // الميزة 2: إضافة كلاس للتحول السلس
        body.classList.add('mode-transition'); 
        const currentMode = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        const finalMode = newMode || (currentMode === 'light-mode' ? 'dark-mode' : 'light-mode');
        
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(finalMode);
        localStorage.setItem('mode', finalMode);
        updateModeIcon(finalMode);
        
        // إزالة الكلاس بعد انتهاء التحول
        setTimeout(() => body.classList.remove('mode-transition'), 300); 
    }

    function updateModeIcon(currentMode) {
        if (toggleButton) {
             toggleButton.innerHTML = (currentMode === 'dark-mode') ? 
                 '<i class="fas fa-sun" title="الوضع النهاري"></i>' : 
                 '<i class="fas fa-moon" title="الوضع الليلي"></i>';
        }
    }

    // تطبيق الوضع المحفوظ عند التحميل
    body.classList.add(savedMode);
    updateModeIcon(savedMode);
    
    if (toggleButton) {
        toggleButton.addEventListener('click', () => toggleMode());
    }
    
    // =============================================================
    // II. تحسينات وظائف البحث والتصفية (Advanced Search & Filter)
    // =============================================================
    
    const debouncedFiltering = debounce(applyFiltering, 300); // الميزة 32

    function applyFiltering() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedEra = filterSelect ? filterSelect.value : 'all'; 

        // الميزة 27: إظهار/إخفاء زر مسح البحث
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
        
        // الميزة 7: رسالة "لا توجد نتائج"
        if (filteredScholars.length === 0) {
             displayNoResults(scholarCardsContainer);
        } else {
             displayScholarCards(filteredScholars, scholarCardsContainer);
        }
    }


    if (searchButton && searchBar && searchInput) {
        // الميزة 4: فتح/إغلاق شريط البحث
        searchButton.addEventListener('click', () => {
            searchBar.classList.toggle('is-visible'); 
            if (searchBar.classList.contains('is-visible')) {
                searchInput.focus();
                document.addEventListener('keydown', handleEscapeKey);
                // الميزة 5: تغيير أيقونة البحث إلى 'x' مؤقتاً
                searchButton.querySelector('i').className = 'fas fa-times';

                 // إظهار التصفية إذا كانت البيانات محملة
                if(allScholarsData.length > 0 && filterSelect && body.id !== 'main-page') {
                    filterSelect.style.display = 'inline-block';
                }
            } else {
                document.removeEventListener('keydown', handleEscapeKey);
                searchButton.querySelector('i').className = 'fas fa-search';
                // الميزة 27: مسح البحث عند الإغلاق
                searchInput.value = '';
                applyFiltering(); 
            }
        });
        
        // الميزة 39: إغلاق البحث باستخدام مفتاح Escape
        function handleEscapeKey(e) {
            if (e.key === 'Escape') {
                searchBar.classList.remove('is-visible');
                searchButton.querySelector('i').className = 'fas fa-search';
                document.removeEventListener('keydown', handleEscapeKey);
                // مسح البحث عند الإغلاق بـ Escape
                searchInput.value = ''; 
                applyFiltering();
            }
        }
        
        searchInput.addEventListener('input', debouncedFiltering);

        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                applyFiltering();
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', applyFiltering);
        }
    }
    
    // =============================================================
    // III. تحسينات تحميل وعرض البيانات (Optimized Data Handling)
    // =============================================================
    
    function createScholarCard(scholar) {
        const card = document.createElement('a');
        // الرابط يتم بناؤه ليتوافق مع نظام مجلد pages
        card.href = `pages/${scholar.id}.html`; 
        card.setAttribute('title', `انقر لعرض صفحة ${scholar.name}`); // الميزة 34
        card.classList.add('scholar-card');
        
        // الميزة 28: تأثير الهز
        card.addEventListener('mouseover', () => card.classList.add('hover-shake')); 
        card.addEventListener('animationend', () => card.classList.remove('hover-shake'));

        // الميزة 29: شارة التمييز
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
            observeNewCards(); // الميزة 15
            updateResultCount(scholars.length); // الميزة 36
        }
    }
    
    function displayNoResults(container) {
        if (container) {
            container.innerHTML = `<div class="no-results-message"><p>😔 عذراً، لم يتم العثور على نتائج مطابقة لطلبك.</p></div>`;
            updateResultCount(0); // الميزة 36
        }
    }
    
    function updateResultCount(count) { // الميزة 36
        const total = allScholarsData.length;
        if (resultsCountElement && total > 0) {
            resultsCountElement.textContent = `عرض ${count} من أصل ${total} شخصية`;
            resultsCountElement.style.display = 'block';
        } else if (resultsCountElement) {
             resultsCountElement.style.display = 'none';
        }
    }

    function setLoadingState(isLoading, message = 'جارِ تحميل البيانات...') { // الميزة 31
        if (loadingMessageElement) {
            loadingMessageElement.innerHTML = isLoading ? `<div class="loader-spinner"></div><p>${message}</p>` : '';
            loadingMessageElement.style.display = isLoading ? 'flex' : 'none';
        }
        if (scholarCardsContainer) {
            scholarCardsContainer.style.display = isLoading ? 'none' : 'grid'; 
        }
    }


    async function loadArchiveData() {
        if (!scholarCardsContainer || body.id === 'main-page') return; // لا يتم التحميل في الصفحة الرئيسية

        setLoadingState(true); // الميزة 31

        // الميزة 33: محاولة استعادة البيانات من الذاكرة المؤقتة
        const cachedData = localStorage.getItem(DATA_CACHE_KEY);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                showToastNotification('تم تحميل البيانات من الذاكرة المؤقتة بنجاح.', 'info');
                processData(data);
                setLoadingState(false);
                return;
            } else {
                localStorage.removeItem(DATA_CACHE_KEY);
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => { // الميزة 20: مهلة التحميل
                controller.abort();
                showToastNotification("⚠️ انتهت مهلة التحميل. يرجى المحاولة لاحقاً.", 'warning');
            }, 5000); 
            
            // 🔄 تم إرجاع المسار إلى وضعه الأصلي (النسبي)
            const response = await fetch('../data/archive.json', { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) { throw new Error('فشل في تحميل ملف البيانات.'); }
            const data = await response.json();
            
            localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); // الميزة 33

            processData(data);
            showToastNotification('✅ تم تحميل بيانات الأرشيف بنجاح.', 'success');

        } catch (error) {
             setLoadingState(false, 'تعذر تحميل المحتوى. يرجى التحقق من اتصالك.');
             console.error("Data loading error:", error);
        } finally {
            setLoadingState(false);
        }
    }

    function processData(data) {
        let dataToDisplay = [];
        const uniqueEras = new Set(); // الميزة 21

        // تحديد أي مجموعة بيانات يجب استخدامها بناءً على معرف الصفحة
        if (document.body.id === 'arab-writers-page') {
            dataToDisplay = data.arabWriters || []; // يجب أن تكون المصفوفة في JSON بهذا الاسم
        } else if (document.body.id === 'arab-scientists-page') {
             dataToDisplay = data.arabScientists || [];
        } 
        // يمكنك إضافة شروط لصفحات أخرى هنا

        // استخلاص العصور للميزة 21
        dataToDisplay.forEach(scholar => uniqueEras.add(scholar.era));

        // الميزة 37: فرز البيانات أبجدياً حسب الاسم افتراضياً
        dataToDisplay.sort((a, b) => a.name.localeCompare(b.name)); 

        allScholarsData = dataToDisplay; 
        displayScholarCards(allScholarsData, scholarCardsContainer);
        populateEraFilter(uniqueEras); // الميزة 23
    }
    
    function populateEraFilter(eras) { // الميزة 23 & 22
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">جميع العصور</option>';
            
            Array.from(eras).sort().forEach(era => { // الميزة 22: فرز العصور
                const option = document.createElement('option');
                option.value = era;
                option.textContent = era;
                filterSelect.appendChild(option);
            });
            
            // الميزة 24: إظهار القائمة المنسدلة فقط إذا كان هناك بيانات
            filterSelect.style.display = eras.size > 0 ? 'inline-block' : 'none'; 
        }
    }

    // تحقق من نوع الصفحة (لتحميل البيانات فقط في صفحات الأرشيف)
    if (document.body.id && document.body.id !== 'main-page') {
         loadArchiveData(); 
    }
    
    // =============================================================
    // IV. ميزات جمالية وتقنية إضافية
    // =============================================================
    
    // الميزة 10/11: الرابط النشط
    const currentPagePath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        link.classList.remove('active-nav-link');
        const linkPath = link.href.split('/').pop();
        if (linkPath === currentPagePath || (linkPath === 'index.html' && currentPagePath === '')) {
            link.classList.add('active-nav-link');
        }
    });

    // الميزة 12/13/16: زر العودة للأعلى (مع إزالة كود الترويسة الثابتة)
    if (backToTopButton) {
        const toggleBackToTop = () => {
             if (window.scrollY > 300) {
                 backToTopButton.classList.add('is-visible');
             } else {
                 backToTopButton.classList.remove('is-visible');
             }
        };

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            // ❌ تم إزالة ميزة الترويسة الثابتة نهائياً من الـ JS
            toggleBackToTop();
        });
        toggleBackToTop(); // تشغيل عند التحميل
    }
    
    // الميزة 17: التحقق من الاتصال بالإنترنت
    function checkConnectivity() {
        if (!navigator.onLine) {
            showToastNotification("⚠️ أنت غير متصل بالإنترنت. قد تكون البيانات قديمة.", 'warning'); 
        }
    }
    
    window.addEventListener('online', () => showToastNotification("✅ تم استعادة الاتصال بالإنترنت.", 'success'));
    window.addEventListener('offline', checkConnectivity);
    checkConnectivity();

    
    // الميزة 14/15: مراقب التقاطع (Intersection Observer)
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-loaded');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); // يتم تشغيله بمجرد ظهور 10% من العنصر

    const observeNewCards = () => {
        document.querySelectorAll('.scholar-card').forEach(card => {
            // التأكد من عدم مراقبته بالفعل
            if (!card.classList.contains('is-loaded')) { 
                observer.observe(card);
            }
        });
    };

    // الميزة 38: اختصار لوحة المفاتيح العالمية (CTRL + K)
    document.addEventListener('keydown', (e) => {
        // CTRL + K لفتح/إغلاق البحث
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault(); 
            if (searchButton) {
                searchButton.click();
            }
        }
        
        // الميزة 39: إغلاق جميع الإشعارات بـ Shift + Escape
        if (e.shiftKey && e.key === 'Escape') {
            const toasts = document.querySelectorAll('#toast-container .toast-notification');
            toasts.forEach(toast => toast.remove());
        }
    });
    
    // الميزة 40: تتبع النقر على زر التبديل (للتطوير)
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
             console.log('Mode Toggled', body.classList.contains('dark-mode') ? 'Dark' : 'Light');
        });
    }
    
    // تطبيق مبدئي لبطاقات الأقسام في الصفحة الرئيسية (لتحريكها عند بدء التشغيل)
    if (document.body.id === 'main-page') {
        observeNewCards();
    }
});
