const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// تعيين محرك القوالب لـ EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// لخدمة الملفات الثابتة (CSS/JS) من مجلد public
app.use(express.static(path.join(__dirname, 'public')));
// لمعالجة البيانات المرسلة من النماذج (Forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DATA_FILE = 'data.json';

// ************************ وظائف قراءة وكتابة البيانات ************************

function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading data file:", error);
        return { 
            arab_scientists: [], 
            arab_writers: [],
            foreign_scientists: [],
            foreign_writers: []
        };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ************************ المسارات (Routes) ************************

// المسار الرئيسي للوحة التحكم (عرض جميع الأقسام)
app.get('/admin', (req, res) => {
    const data = readData();
    res.render('dashboard', { data }); // Dashboard EJS
});

// مسار عرض نموذج إضافة شخصية جديدة
app.get('/admin/add', (req, res) => {
    // نمرر أسماء الأقسام لنموذج الإضافة
    const sections = Object.keys(readData());
    res.render('add_form', { sections }); 
});

// مسار معالجة إضافة شخصية جديدة
app.post('/admin/add', (req, res) => {
    const { section, name, bio, era, image } = req.body;
    const data = readData();
    
    if (data[section]) {
        // إنشاء ID فريد بسيط
        const newId = name.toLowerCase().replace(/\s/g, '_').substring(0, 20) + Date.now().toString().substring(10);
        
        const newEntry = { id: newId, name, bio, era, image };
        data[section].push(newEntry);
        writeData(data);
        res.redirect('/admin'); // العودة إلى لوحة التحكم
    } else {
        res.status(400).send('القسم غير موجود!');
    }
});

// مسار معالجة حذف شخصية
app.post('/admin/delete/:section/:id', (req, res) => {
    const { section, id } = req.params;
    const data = readData();
    
    if (data[section]) {
        // تصفية القائمة لإزالة العنصر المطابق للـ ID
        data[section] = data[section].filter(item => item.id !== id);
        writeData(data);
        res.redirect('/admin');
    } else {
        res.status(400).send('خطأ في الحذف.');
    }
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`لوحة التحكم تعمل على http://localhost:${port}/admin`);
    console.log(`(ملاحظة: في Replit، استخدم رابط الويب الظاهر في الأعلى)`);
});
