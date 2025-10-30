document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('mode-toggle');
    const body = document.body;

    // 1. التحقق من الوضع المحفوظ في المتصفح (localStorage)
    const savedMode = localStorage.getItem('mode') || 'light-mode';
    body.className = savedMode;
    updateButtonText(savedMode);

    // 2. وظيفة لتحديث نص الزر حسب الوضع الحالي
    function updateButtonText(currentMode) {
        if (currentMode === 'dark-mode') {
            toggleButton.innerHTML = 'تبديل الوضع (☀️)';
        } else {
            toggleButton.innerHTML = 'تبديل الوضع (🌙)';
        }
    }

    // 3. مستمع حدث النقر على الزر
    toggleButton.addEventListener('click', () => {
        // إذا كان الوضع الحالي نهاري (light-mode)، فقم بالتحويل إلى ليلي (dark-mode)
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('mode', 'dark-mode');
            updateButtonText('dark-mode');
        } else {
            // وإلا، حول إلى نهاري
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('mode', 'light-mode');
            updateButtonText('light-mode');
        }
    });

    // تحديث السنة في التذييل تلقائيًا
    document.getElementById('year').textContent = new Date().getFullYear();
});
