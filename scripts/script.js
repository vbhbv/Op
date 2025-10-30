document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const body = document.body;
    const searchButton = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    // =============================================================
    // 1. وظائف الوضع الليلي والنهاري (Mode Toggle Functions)
    // =============================================================
    
    // تحميل الوضع المحفوظ والتعيين المبدئي
    const savedMode = localStorage.getItem('mode') || 'light-mode';
    body.className = savedMode;
    updateModeIcon(savedMode);

    function updateModeIcon(currentMode) {
        // تحديث أيقونة الزر لتعكس الوضع الذي سيتم التحويل إليه
        toggleButton.innerHTML = (currentMode === 'dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    toggleButton.addEventListener('click', () => {
        const newMode = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
        body.classList.replace(body.className, newMode);
        localStorage.setItem('mode', newMode);
        updateModeIcon(newMode);
    });

    // =============================================================
    // 2. وظائف البحث (Search Functions)
    // =============================================================

    searchButton.addEventListener('click', () => {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus();
        }
    });

    // *يمكنك هنا إضافة كود معالجة البحث الفعلي عند ضغط Enter*

    // =============================================================
    // 3. وظائف تحميل وعرض البيانات (Data Loading & Display)
    // =============================================================
    
    async function loadArchiveData() {
        try {
            // تحميل ملف البيانات من المسار النسبي (يعمل على GitHub Pages)
            const response = await fetch('../data.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const archiveData = await response.json();
            
            // تحديد الصفحة الحالية والبيانات المراد عرضها
            // يجب تحديد ID لكل وسم <body> في صفحات الأقسام (مثل <body id="arab-scientists">)
            const bodyId = document.body.id;
            let currentData = null;
            let containerId = null;

            if (bodyId === 'arab-scientists-page') {
                currentData = archiveData.arab_scientists;
                containerId = 'scholar-cards-container';
            } else if (bodyId === 'arab-writers-page') {
                currentData = archiveData.arab_writers;
                containerId = 'scholar-cards-container';
            }
            // أضف المزيد من الشروط للأقسام الأخرى (علماء/أدباء أجانب)
            
            if (currentData && containerId) {
                displayScholarCards(currentData, containerId);
            }

        } catch (error) {
            console.error("خطأ حرج في تحميل بيانات الأرشيف:", error);
            // رسالة للمستخدم في حالة فشل التحميل
            const mainContainer = document.querySelector('.main-container');
            if(mainContainer) {
                mainContainer.innerHTML = '<p style="color: red; text-align: center;">عذراً، لم نتمكن من تحميل بيانات الأرشيف حالياً.</p>';
            }
        }
    }
    
    // وظيفة بناء بطاقات الشخصيات وعرضها
    function displayScholarCards(scholars, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ''; // تنظيف المحتوى القديم

        scholars.forEach(scholar => {
            const card = document.createElement('a');
            // الرابط سيذهب إلى صفحة scholar_profile مع تمرير ID الشخصية
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

    // تشغيل وظيفة تحميل البيانات عند بدء تشغيل الصفحة
    loadArchiveData();
});
