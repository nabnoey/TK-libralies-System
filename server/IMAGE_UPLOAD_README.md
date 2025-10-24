# การอัปโหลดรูปภาพสำหรับ Karaoke และ Movie

## การเปลี่ยนแปลง

ระบบได้รับการอัปเดตให้รองรับการอัปโหลดไฟล์รูปภาพแบบ **drag & drop** หรือ **คลิกเพื่อเลือกไฟล์** โดยใช้ `multipart/form-data` แทนการส่ง base64

## คุณสมบัติ

- รองรับไฟล์รูปภาพ: `jpeg`, `jpg`, `png`, `gif`, `webp`
- จำกัดขนาดไฟล์: **ไม่เกิน 5MB**
- ไฟล์จะถูกเก็บในโฟลเดอร์ `server/uploads/`
- ชื่อไฟล์จะถูกสร้างแบบ unique เพื่อป้องกันการซ้ำกัน

## API Endpoints

### 1. Karaoke Room

#### สร้างห้องคาราโอเกะใหม่
```http
POST /api/v1/karaoke-room
Content-Type: multipart/form-data

Form Data:
- name: "ชื่อห้อง" (required)
- image: <file> (required)
```

#### อัปเดตห้องคาราโอเกะ
```http
PUT /api/v1/karaoke-room/:id
Content-Type: multipart/form-data

Form Data:
- name: "ชื่อห้องใหม่" (optional)
- image: <file> (optional)
```

### 2. Movie Seat

#### สร้างโรงหนังใหม่
```http
POST /api/v1/movie-seat
Content-Type: multipart/form-data

Form Data:
- name: "ชื่อโรงหนัง" (required)
- image: <file> (required)
```

#### อัปเดตโรงหนัง
```http
PUT /api/v1/movie-seat/:id
Content-Type: multipart/form-data

Form Data:
- name: "ชื่อโรงหนังใหม่" (optional)
- image: <file> (optional)
```

## วิธีทดสอบด้วย Swagger UI

1. เปิด Swagger UI ที่ `http://localhost:5000/api-docs`
2. ไปที่ endpoint ที่ต้องการทดสอบ (POST หรือ PUT)
3. คลิก "Try it out"
4. กรอกข้อมูล `name`
5. คลิก "Choose File" ในช่อง `image` เพื่อเลือกไฟล์รูปภาพ
6. คลิก "Execute"

## วิธีทดสอบด้วย Postman

1. สร้าง request ใหม่ (POST หรือ PUT)
2. เลือก Body tab
3. เลือก `form-data`
4. เพิ่มฟิลด์:
   - Key: `name`, Value: "ชื่อของคุณ"
   - Key: `image`, Type: `File`, Value: เลือกไฟล์รูปภาพ
5. ส่ง request

## ตัวอย่างการใช้งานด้วย JavaScript (Fetch API)

```javascript
const formData = new FormData();
formData.append('name', 'Karaoke Room VIP');
formData.append('image', fileInput.files[0]); // fileInput คือ <input type="file">

fetch('http://localhost:5000/api/v1/karaoke-room', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}` // ถ้าต้องการ auth
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data.image จะเป็น path เช่น "/uploads/image-1234567890.jpg"
  })
  .catch(error => console.error('Error:', error));
```

## ตัวอย่างการใช้งานด้วย React

```jsx
import { useState } from 'react';

function UploadForm() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/api/v1/karaoke-room', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload success:', data);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อห้อง"
        required
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        required
      />
      <button type="submit">สร้างห้อง</button>
    </form>
  );
}
```

## การแสดงรูปภาพ

เมื่อ API ส่งข้อมูลกลับมา จะได้ path รูปภาพในรูปแบบ:
```json
{
  "image": "/uploads/image-1234567890.jpg"
}
```

สามารถแสดงรูปภาพได้โดย:
```html
<img src="http://localhost:5000/uploads/image-1234567890.jpg" alt="Room" />
```

หรือใน React:
```jsx
<img src={`${API_URL}${room.image}`} alt={room.name} />
```

## โครงสร้างไฟล์

```
server/
├── middlewares/
│   └── upload.middleware.js    # Multer configuration
├── uploads/                     # โฟลเดอร์เก็บรูปภาพที่อัปโหลด
│   └── .gitkeep                # ให้ git track โฟลเดอร์นี้
├── routers/
│   ├── karaokeRoom.router.js   # เพิ่ม upload.single('image')
│   └── movieSeat.router.js     # เพิ่ม upload.single('image')
├── controllers/
│   ├── karaokeRoom.controller.js  # อัปเดตให้ใช้ req.file
│   └── movieSeat.controller.js    # อัปเดตให้ใช้ req.file
└── index.js                    # เพิ่ม static file serving
```

## หมายเหตุสำคัญ

1. โฟลเดอร์ `uploads/` ถูก ignore ใน git แล้ว
2. ไฟล์รูปภาพจะถูกสร้างชื่อใหม่แบบ unique โดยอัตโนมัติ
3. Server จะให้บริการไฟล์ static ผ่าน `/uploads` endpoint
4. ฝั่ง Client ไม่ต้องแก้ไขอะไร สามารถใช้ form-data ได้เลย
