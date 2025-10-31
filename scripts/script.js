document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const searchButton = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const body = document.body;
    
    // =============================================================
    // 1. وظائف الوضع الليلي والنهاري (Mode Toggle Functions)
    // =============================================================
    
    // تحميل الوضع المحفوظ والتعيين المبدئي
    const savedMode = localStorage.getItem('mode') || 'light-mode';
    // التأكد من أن body لا يحمل وضعاً قديماً قبل إضافة الوضع الجديد
    body.className = body.className.split(' ').filter(c => c !== 'light-mode' && c !== 'dark-mode').join(' ') + ' ' + savedMode;
    

    function updateModeIcon(currentMode) {
        if (toggleButton) {
             // تحديد الأيقونة المناسبة (شمس للنهاري، قمر لليلي)
             toggleButton.innerHTML = (currentMode === 'dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }
    
    // تشغيل تحديث الأيقونة عند التحميل
    if (toggleButton) {
        updateModeIcon(savedMode);

        toggleButton.addEventListener('click', () => {
            const newMode = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            
            // تبديل الكلاسات بأمان
            const classes = body.className.split(' ').filter(c => c !== 'light-mode' && c !== 'dark-mode');
            body.className = classes.join(' ') + ' ' + newMode;

            localStorage.setItem('mode', newMode);
            updateModeIcon(newMode);
        });
    }

    // =============================================================
    // 2. وظائف البحث (Search Functions)
    // =============================================================
    
    // التأكد من وجود جميع عناصر البحث قبل إضافة المستمعين
    if (searchButton && searchBar && searchInput) {
        searchButton.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                searchInput.focus();
            }
        });
        
        // يمكن إضافة وظيفة التصفية/البحث هنا لاحقاً
        searchInput.addEventListener('keyup', (e) => {
            // [هنا يمكن إضافة كود التصفية حسب الإدخال]
        });
    }


    // =============================================================
    // 3. وظائف تحميل وعرض البيانات (لصفحات الأرشيف التي تحتاج JSON)
    // =============================================================
    
    // دالة إنشاء بطاقة لعرضها
    function createScholarCard(scholar) {
        const card = document.createElement('a');
        card.href = `pages/${scholar.id}.html`; // يجب أن يكون مسار الصفحات هكذا
        card.classList.add('scholar-card');
        card.classList.add(`${scholar.id}-card`); // لإضافة تنسيق خاص (مثل joahire-card)
        
        // إنشاء محتوى البطاقة (صورة، اسم، نبذة)
        card.innerHTML = `
            <img src="../Images/${scholar.image}" alt="صورة ${scholar.name}" class="scholar-image">
            <div class="scholar-info">
                <h4 class="scholar-name">${scholar.name}</h4>
                <p class="scholar-bio-snippet">${scholar.bio_snippet}</p>
                <span class="era-tag">${scholar.era}</span>
            </div>
        `;
        return card;
    }

    // دالة لعرض البطاقات في الحاوية المحددة
    function displayScholarCards(scholars, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // تفريغ الحاوية قبل الإضافة لمنع التكرار (هنا يتم إزالة الكود اليدوي)
            container.innerHTML = ''; 
            
            scholars.forEach(scholar => {
                container.appendChild(createScholarCard(scholar));
            });
        }
    }

    // دالة تحميل البيانات من ملف JSON
    async function loadArchiveData() {
        try {
            // نفترض أن ملف البيانات هو data/archive.json
            const response = await fetch('../data/archive.json');
            if (!response.ok) {
                throw new Error('فشل في تحميل ملف البيانات: ' + response.statusText);
            }
            const data = await response.json();
            
            // تحديد الصفحة الحالية لعرض البيانات المناسبة
            if (document.body.id === 'arab-writers-page') {
                displayScholarCards(data.arabWriters, 'scholar-cards-container');
            } 
            // يمكن إضافة أقسام أخرى هنا لاحقاً
            
        } catch (error) {
            console.error('خطأ في معالجة بيانات الأرشيف:', error);
            // في حالة الخطأ، نترك الكود اليدوي في HTML كما هو (لكن لا يجب مسحه في البداية)
        }
    }

    // =============================================================
    // 🚨 نقطة التوقف الحالية لمنع الاختفاء 🚨
    // =============================================================
    
    // الكود اليدوي هنا كان:
    // if (document.body.id && document.body.id.includes('-page')) {
    //     loadArchiveData(); 
    // }
    
    // **الحل المؤقت:** عدم تشغيل loadArchiveData() تلقائياً
    // إذا كنت تخطط للاعتماد على الكود المكتوب يدوياً في arab_writers.html، 
    // فمن الأفضل عدم تشغيل دالة loadArchiveData() في هذه الصفحة أبداً.
    
    // **الحل البديل:** إذا أردت استخدام JSON في المستقبل، يجب إزالة البطاقات المكتوبة يدوياً من HTML.
    
    // في الوقت الحالي، سنترك دالة loadArchiveData معطلة لمنع الاختفاء
    // حتى تتمكن من رؤية البطاقات اليدوية بشكل دائم.

});
