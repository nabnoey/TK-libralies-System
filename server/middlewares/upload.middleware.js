const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดตำแหน่งและชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน เช่น: karaoke-1234567890.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// กรองไฟล์เฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, jpg, png, gif, webp)'));
    }
};

// สร้าง multer middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ไม่เกิน 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
