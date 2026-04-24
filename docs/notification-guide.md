# Panduan Lengkap Penggunaan Fitur Notifikasi

Panduan ini berisi alur kerja dan penggunaan fitur notifikasi (Firebase Cloud Messaging / FCM) untuk diimplementasikan pada aplikasi **Mobile** maupun **Web** yang terhubung ke backend portal Work Order.

---

## 1. Konsep Dasar & Alur Kerja

Sistem notifikasi pada aplikasi ini menggunakan kombinasi **Firebase Cloud Messaging (FCM)** untuk pengiriman *push notification* secara *real-time* dan **Database Internal (MongoDB)** sebagai Kotak Masuk (Inbox) untuk menyimpan riwayat notifikasi.

**Alur Kerja Utama:**
1. **Login:** Saat user berhasil login, aplikasi (Web/Mobile) meminta *permission* notifikasi dan meng-generate FCM Token dari Firebase SDK.
2. **Registrasi Token:** Aplikasi mengirim FCM Token tersebut ke Backend agar Backend tahu ke perangkat mana notifikasi harus dikirim.
3. **Menerima Notifikasi:** Saat ada event tertentu (misal: Work Order ditugaskan), Backend mengirim notifikasi ke FCM Token tersebut. Firebase SDK di sisi Web/Mobile yang akan menampilkan pop-up notifikasi.
4. **Melihat Inbox:** User dapat melihat seluruh riwayat notifikasi dengan mengakses halaman *Notification Inbox*, yang datanya ditarik langsung dari Backend.
5. **Logout:** Saat user logout, aplikasi harus memberitahu Backend untuk menghapus FCM Token tersebut agar perangkat tidak lagi menerima notifikasi.

---

## 2. Panduan Integrasi API (Untuk Developer Frontend Web / Mobile)

Berikut adalah daftar endpoint REST API yang harus diintegrasikan di sisi frontend:

### A. Registrasi FCM Token (Saat Login / Buka Aplikasi)
Setiap kali user berhasil login, atau saat aplikasi dibuka (untuk memastikan token masih valid), kirimkan FCM token yang didapat dari Firebase SDK ke endpoint ini.

- **Endpoint:** `POST /notifications/fcm-token`
- **Headers:** `Authorization: Bearer <Access-Token>`
- **Body Request:**
  ```json
  {
    "token": "eY_blablabla...token_dari_firebase"
  }
  ```
- **Catatan:** Backend akan menambahkan token ini ke profil user. Satu user bisa memiliki banyak token (jika login dari beberapa perangkat yang berbeda).

### B. Menghapus FCM Token (Saat Logout)
Sangat penting memanggil endpoint ini sebelum menghapus sesi lokal saat *logout*, agar token dicabut dari database dan perangkat berhenti menerima notifikasi.

- **Endpoint:** `DELETE /notifications/fcm-token`
- **Headers:** `Authorization: Bearer <Access-Token>`
- **Body Request:**
  ```json
  {
    "token": "eY_blablabla...token_dari_firebase"
  }
  ```

### C. Mengambil Riwayat Notifikasi (Inbox)
Gunakan endpoint ini untuk menampilkan daftar notifikasi yang pernah diterima user di halaman "Notifikasi" atau ikon "Lonceng".

- **Endpoint:** `GET /notifications`
- **Headers:** `Authorization: Bearer <Access-Token>`
- **Response:**
  ```json
  [
    {
      "_id": "60d5ecb54...345",
      "userId": "60d...123",
      "title": "Work Order Baru #WO-2024-001",
      "body": "Anda telah ditugaskan pada pekerjaan Perbaikan AC.",
      "data": {
        "type": "WORK_ORDER_ASSIGNED",
        "entityId": "60e...999",
        "path": "/work-orders/60e...999"
      },
      "isRead": false,
      "createdAt": "2026-04-24T10:00:00Z"
    }
  ]
  ```
- **Catatan:** Saat endpoint ini dipanggil, backend akan secara otomatis mengubah status `isRead` dari `false` menjadi `true` pada semua notifikasi milik user tersebut. Sehingga panggilan berikutnya akan mengembalikan `isRead: true`.

---

## 3. Penanganan Notifikasi di Sisi Klien (Frontend / Mobile App)

Anda perlu menggunakan **Firebase SDK** yang sesuai (*Firebase JS SDK* untuk Web, *FlutterFire* untuk Flutter, atau SDK Native untuk Android/iOS).

### A. Menangkap Notifikasi saat Aplikasi Berjalan (Foreground)
Ketika aplikasi sedang aktif dibuka (Foreground), biasanya OS tidak memunculkan banner notifikasi. Anda harus menangkap pesannya dari Firebase SDK dan memunculkan *In-App Toast* atau *Snackbar* secara manual.

### B. Menangkap Notifikasi saat Aplikasi di Latar Belakang (Background / Terminated)
Ketika aplikasi sedang tidak dibuka, OS akan otomatis menampilkan banner notifikasi berdasarkan atribut `title` dan `body` dari backend.

### C. Navigasi / Deep Linking (Merespons Klik Notifikasi)
Ketika banner notifikasi diklik, Anda dapat mengarahkan user ke halaman yang tepat menggunakan informasi tambahan (Payload) yang diselipkan Backend di dalam objek `data`.

**Contoh Payload dari Backend:**
```json
{
  "notification": {
    "title": "Work Order Baru #WO-2024-001",
    "body": "Anda telah ditugaskan pada pekerjaan Perbaikan AC."
  },
  "data": {
    "type": "WORK_ORDER_ASSIGNED",
    "entityId": "65b2a1...",
    "path": "/work-orders/65b2a1..."
  }
}
```

**Logika Penanganan (Pseudo-code):**
```javascript
FirebaseMessaging.onMessageOpenedApp((message) => {
  const { path, type } = message.data;
  
  // Arahkan (navigate) user ke halaman sesuai "path"
  if (path) {
    router.push(path); 
  }
});
```

## Kesimpulan untuk Tim Frontend:
1. Pasang Firebase SDK (atur google-services.json / plist).
2. Mintalah izin (Request Permission) notifikasi kepada pengguna.
3. Dapatkan FCM Token dari Firebase.
4. Kirim FCM Token ke `POST /notifications/fcm-token`.
5. Tangkap pesan Foreground & Background menggunakan listener Firebase.
6. Buat halaman Inbox khusus yang menarik data dari `GET /notifications`.
7. Jangan lupa panggil `DELETE /notifications/fcm-token` saat logout.
