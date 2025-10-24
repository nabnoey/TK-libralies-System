# คู่มือการแก้ไข 502 Bad Gateway บน Render

## สาเหตุที่แก้ไขแล้ว

### 1. เปลี่ยนลำดับการ start server
**ก่อน:** Database sync ก่อน → server start
**หลัง:** Server start ก่อน → database sync

เหตุผล: Render ต้องการ health check ภายใน 90 วินาที หาก DB connection ช้า server จะไม่ start ทัน

### 2. เพิ่ม Host Binding
เปลี่ยนจาก `app.listen(PORT)` เป็น `app.listen(PORT, '0.0.0.0')`

เหตุผล: Render ต้องการให้ bind กับ `0.0.0.0` เพื่อรับ request จากภายนอก

### 3. เพิ่ม Connection Pool Config
```javascript
pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
}
```

เหตุผล: ป้องกัน connection leak และ timeout

### 4. เพิ่ม Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

## ขั้นตอนการ Deploy บน Render

### 1. ตั้งค่า Environment Variables

ไปที่ Render Dashboard → เลือก Web Service → Environment

เพิ่มตัวแปรต่อไปนี้:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2. ตั้งค่า Build & Start Command

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && npm start
```

### 3. ตั้งค่า Health Check Path (Optional)

ใน Render Dashboard → Settings → Health Check Path:
```
/health
```

### 4. ตรวจสอบ Logs

หลัง deploy แล้ว ตรวจสอบ logs ว่ามีข้อความต่อไปนี้:

```
Server is running on port 5000
Connection has been established successfully!
DB synced
```

## การทดสอบหหลัง Deploy

### 1. ทดสอบ Health Check
```bash
curl https://tk-libralies-system.onrender.com/health
```

ควรได้:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. ทดสอบ Root Endpoint
```bash
curl https://tk-libralies-system.onrender.com/
```

ควรได้:
```
TK-libralies-System
```

### 3. ทดสอบ Swagger UI
เปิดในเบราว์เซอร์:
```
https://tk-libralies-system.onrender.com/api-docs/
```

## ปัญหาที่อาจพบและวิธีแก้

### ปัญหา: Database Connection Error
**อาการ:** เห็น "Unable to connect to the database!" ใน logs

**วิธีแก้:**
1. ตรวจสอบ Environment Variables ว่าถูกต้อง
2. ตรวจสอบว่า Database อนุญาต connection จาก Render IP
3. ตรวจสอบ SSL certificate

### ปัญหา: Swagger UI ไม่แสดง
**อาการ:** 404 Not Found ที่ /api-docs

**วิธีแก้:**
1. ตรวจสอบว่า `swagger-jsdoc` และ `swagger-ui-express` ถูก install
2. ตรวจสอบไฟล์ `config/swagger.js`

### ปัญหา: Upload ไม่ทำงาน
**อาการ:** รูปภาพอัปโหลดไม่ได้

**วิธีแก้:**
Render ใช้ ephemeral filesystem ดังนั้นรูปภาพที่อัปโหลดจะหายเมื่อ redeploy

**แนะนำ:** ใช้ Cloud Storage เช่น:
- Cloudinary
- AWS S3
- Google Cloud Storage

## Monitoring

### ดู Logs แบบ Real-time
ใน Render Dashboard → Logs

หรือใช้ CLI:
```bash
render logs -s your-service-name --tail
```

### ดู Metrics
ใน Render Dashboard → Metrics
- CPU Usage
- Memory Usage
- Request Count
- Response Time

## Tips สำหรับ Production

1. **เปิด logging:** เปลี่ยน `logging: false` เป็น `logging: console.log` ใน development
2. **ใช้ Environment Variables:** อย่า hardcode sensitive data
3. **เพิ่ม Rate Limiting:** ป้องกัน DDoS
4. **เพิ่ม Error Handling:** จัดการ error ให้ดีขึ้น
5. **ใช้ CDN:** สำหรับ static files
6. **Backup Database:** สำรองข้อมูลเป็นประจำ

## ติดต่อ Support

หากยังมีปัญหา:
1. ตรวจสอบ Render Status: https://status.render.com/
2. ดู Render Docs: https://render.com/docs
3. ถาม Community: https://community.render.com/
