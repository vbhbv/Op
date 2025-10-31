document.addEventListener('DOMContentLoaded', () => {
    // التأكد من أن جميع العناصر موجودة قبل محاولة استخدامها
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
    body.className = savedMode;
    if (toggleButton) {
        updateModeIcon(savedMode);
    }

    function updateModeIcon(currentMode) {
        // تحديث أيقونة الزر لتعكس الوضع الذي سيتم التحويل إليه
        // fas fa-sun (شمس) لوضع النهار، fas fa-moon (قمر) لوضع الليل
        toggleButton.innerHTML = (currentMode === 'dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    // إضافة معالج الحدث فقط إذا كان الزر موجوداً
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const newMode = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            
            // استخدام replace آمن دائماً لتغيير الكلاس
            body.classList.replace(body.className.split(' ').filter(c => c !== 'light-mode' && c !== 'dark-mode').join(' ') + ' ' + body.className, newMode);
            
            localStorage.setItem('mode', newMode);
            updateModeIcon(newMode);
        });
    }

    // =============================================================
    // 2. وظائف البحث (Search Functions)
    // =============================================================
    
    // إضافة معالج الحدث فقط إذا كانت جميع عناصر البحث موجودة
    if (searchButton && searchBar && searchInput) {
        searchButton.addEventListener('click', () => {
            // تبديل حالة كلاس "hidden"
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                searchInput.focus();
            }
        });
    }

    // =============================================================
    // 3. وظائف تحميل وعرض البيانات (Data Loading & Display) - تم تعديل المسار
    // =============================================================
    
    async function loadArchiveData() {
        try {
            // استخدام مسار آمن نسبي (لصفحات الأقسام)
            const response = await fetch('../data.json'); 
            if (!response.ok) {
                // إذا فشل المسار النسبي، جرب المسار المطلق للجذر (لصفحات داخل pages/)
                const rootResponse = await fetch('data.json');
                 if (!rootResponse.ok) {
                     throw new Error(`HTTP error! status: ${rootResponse.status}`);
                 }
                 const archiveData = await rootResponse.json();
                 processData(archiveData);
                 return;
            }
            const archiveData = await response.json();
            processData(archiveData);

        } catch (error) {
            console.error("خطأ حرج في تحميل بيانات الأرشيف:", error);
        }
    }
    
    function processData(archiveData) {
         // هذه الوظيفة تستخدم فقط في صفحات الأقسام، ولن تعمل في index.html
         // لكن نحافظ عليها لصفحات مثل arab_writers.html
         const bodyId = document.body.id;
         let currentData = null;
         let containerId = 'scholar-cards-container';
         
         if (bodyId === 'arab-scientists-page') {
             currentData = archiveData.arab_scientists;
         } else if (bodyId === 'arab-writers-page') {
             currentData = archiveData.arab_writers;
         }
         
         if (currentData && containerId) {
             displayScholarCards(currentData, containerId);
         }
    }

    function displayScholarCards(scholars, containerId) {
        // [وظيفة عرض البطاقات كما هي]
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ''; 

        scholars.forEach(scholar => {
            const card = document.createElement('a');
            card.href = `scholar_profile.html?id=${scholar.id}`; 
            card.className = 'scholar-card';
            card.innerHTML = `
                <img src="../images/${scholar.image}" alt="صورة ${scholar.name}" class="scholar-image">
                <div class="scholar-info">
                    <h4 class="scholar-name">${scholar.name}</h4>
                    <p class="scholar-bio-snippet">${scholar.bio.substring(0, 70)}...</p>
                    <span class="era-tag">${scholar.era}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // يتم تشغيل تحميل البيانات فقط إذا كان في صفحة قسم
    if (document.body.id && document.body.id.includes('-page')) {
        loadArchiveData();
    }
});
