document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const body = document.body;
    const searchButton = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');

    // 1. إدارة الوضع الليلي/النهاري
    const savedMode = localStorage.getItem('mode') || 'light-mode';
    body.className = savedMode;
    updateModeIcon(savedMode);

    function updateModeIcon(currentMode) {
        if (currentMode === 'dark-mode') {
            toggleButton.innerHTML = '<i class="fas fa-sun"></i>'; // شمس للوضع النهاري
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon"></i>'; // قمر للوضع الليلي
        }
    }

    toggleButton.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('mode', 'dark-mode');
            updateModeIcon('dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('mode', 'light-mode');
            updateModeIcon('light-mode');
        }
    });

    // 2. إدارة أيقونة البحث
    searchButton.addEventListener('click', () => {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus(); // تركيز المؤشر في مربع البحث عند فتحه
        }
    });

    // يمكنك إضافة وظيفة البحث الفعلية هنا (مثال: توجيه المستخدم لصفحة بحث)
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            // مثال على التوجيه لصفحة بحث (يجب عليك إنشاء صفحة search_results.html)
            // window.location.href = `search_results.html?q=${encodeURIComponent(searchInput.value.trim())}`;
            console.log("البحث عن:", searchInput.value.trim());
            // يمكن هنا إضافة ميزة بحث فورية لاحقا (Live Search)
        }
    });
});
