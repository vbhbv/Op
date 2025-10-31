// دوال الدعم الأساسية
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
    const loadingMessageElement = document.getElementById('loading-message'); 
    const resultsCountElement = document.getElementById('results-count');

    // 🛑 تم حذف جميع المتغيرات والدوال المتعلقة بتحميل ومعالجة JSON

    // =============================================================
    // I. تحسينات الوضع الليلي/النهاري (Enhanced Mode Toggle)
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
    // II. تحسينات وظائف البحث والتصفية (Manual Search & Filter)
    // =============================================================
    
    // 🛑 تم حذف دالة debounce
    
    // 🛑 وظيفة البحث والتصفية الآن تعتمد على DOM مباشرة (لأننا أزلنا مصفوفة البيانات)
    function applyFiltering() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedEra = filterSelect ? filterSelect.value : 'all'; 

        if (clearSearchButton) {
            clearSearchButton.style.display = searchTerm ? 'block' : 'none';
        }

        let visibleCount = 0;
        const cards = document.querySelectorAll('.scholar-card');

        cards.forEach(card => {
            const name = card.querySelector('.scholar-name').textContent.toLowerCase();
            const bio = card.querySelector('.scholar-bio-snippet').textContent.toLowerCase();
            const era = card.querySelector('.era-tag').textContent;
            
            const matchesSearch = name.includes(searchTerm) || bio.includes(searchTerm);
                                  
            const matchesEra = selectedEra === 'all' || era === selectedEra;
            
            if (matchesSearch && matchesEra) {
                card.style.display = 'flex'; // إظهار البطاقة
                visibleCount++;
            } else {
                card.style.display = 'none'; // إخفاء البطاقة
            }
        });
        
        // رسالة لا توجد نتائج
        if (visibleCount === 0 && scholarCardsContainer) {
             scholarCardsContainer.innerHTML = `<div class="no-results-message"><p>😔 عذراً، لم يتم العثور على نتائج مطابقة لطلبك.</p></div>`;
             // إعادة إضافة البطاقات بعد ظهورها
             cards.forEach(card => scholarCardsContainer.appendChild(card));
        } else if (visibleCount > 0 && scholarCardsContainer.querySelector('.no-results-message')) {
            // إزالة رسالة لا توجد نتائج إذا كانت موجودة
             const noResults = scholarCardsContainer.querySelector('.no-results-message');
             if (noResults) noResults.remove();
        }

        // 🛑 تم حذف تحديث عدد النتائج (resultsCountElement) لأنه يتطلب البيانات الكلية
        
        // يجب أن تظهر التصفية إذا كانت البطاقات مكتوبة يدوياً في HTML
        if(filterSelect && body.id !== 'main-page') {
            filterSelect.style.display = 'inline-block';
        }
    }

    if (searchButton && searchBar && searchInput) {
        searchButton.addEventListener('click', () => {
            searchBar.classList.toggle('is-visible'); 
            if (searchBar.classList.contains('is-visible')) {
                searchInput.focus();
                document.addEventListener('keydown', handleEscapeKey);
                searchButton.querySelector('i').className = 'fas fa-times';

            } else {
                document.removeEventListener('keydown', handleEscapeKey);
                searchButton.querySelector('i').className = 'fas fa-search';
                searchInput.value = '';
                applyFiltering(); 
            }
        });
        
        function handleEscapeKey(e) {
            if (e.key === 'Escape') {
                searchBar.classList.remove('is-visible');
                searchButton.querySelector('i').className = 'fas fa-search';
                document.removeEventListener('keydown', handleEscapeKey);
                searchInput.value = ''; 
                applyFiltering();
            }
        }
        
        searchInput.addEventListener('input', applyFiltering); // 🛑 بدون Debounce
        
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
    
    // 🛑 تم حذف جميع وظائف تحميل ومعالجة البيانات (loadArchiveData و processData)
    // 🛑 تم حذف دالة populateEraFilter (التصفية تتم يدوياً الآن عبر DOM)


    // =============================================================
    // III. ميزات جمالية وتقنية إضافية
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

    // الميزة 12/13/16: زر العودة للأعلى
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
            toggleBackToTop();
        });
        toggleBackToTop(); 
    }
    
    // الميزة 17: التحقق من الاتصال بالإنترنت
    function checkConnectivity() {
        if (!navigator.onLine) {
            showToastNotification("⚠️ أنت غير متصل بالإنترنت.", 'warning'); 
        }
    }
    
    window.addEventListener('online', () => showToastNotification("✅ تم استعادة الاتصال بالإنترنت.", 'success'));
    window.addEventListener('offline', checkConnectivity);
    checkConnectivity();

    
    // الميزة 14/15: مراقب التقاطع (لتحريك البطاقات عند الظهور)
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-loaded');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 

    const observeNewCards = () => {
        document.querySelectorAll('.scholar-card').forEach(card => {
            if (!card.classList.contains('is-loaded')) { 
                observer.observe(card);
            }
        });
    };
    
    // تطبيق المراقب على البطاقات الموجودة يدوياً
    observeNewCards();

    // الميزة 38: اختصار لوحة المفاتيح العالمية (CTRL + K)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault(); 
            if (searchButton) {
                searchButton.click();
            }
        }
        
        if (e.shiftKey && e.key === 'Escape') {
            const toasts = document.querySelectorAll('#toast-container .toast-notification');
            toasts.forEach(toast => toast.remove());
        }
    });
    
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
             console.log('Mode Toggled', body.classList.contains('dark-mode') ? 'Dark' : 'Light');
        });
    }

});
