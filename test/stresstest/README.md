# Stress Testing — Work Order Portal

Panduan lengkap untuk menjalankan stress testing pada aplikasi Work Order Portal menggunakan **k6**.

---

## 1. Prasyarat

### 1.1 Install k6

**Windows (PowerShell):**
```powershell
winget install k6
# atau download installer dari https://k6.io/docs/get-started/installation/
```

**Linux / macOS:**
```bash
# Ubuntu/Debian
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6
```

Verifikasi instalasi:
```bash
k6 version
```

### 1.2 Persiapan Server

1. **Nonaktifkan rate limiting** di Railway (set `THROTTLE_LIMIT=0` di environment variables)
2. **Pastikan server dapat diakses** dari jaringan Anda
3. **Catat BASE_URL** server (misal: `https://workorder-portal.up.railway.app`)

---

## 2. Struktur File

```
test/stresstest/
├── config.js                    # Konfigurasi: BASE_URL, akun test, threshold
├── helpers/
│   └── setup.js                 # Script setup data test (register users, create data)
├── scenarios/
│   ├── 01-auth.js               # Auth flow (register, login, profile, logout)
│   ├── 02-public-client.js      # Public endpoints + membership + customer pairing
│   ├── 03-service-request.js    # Service request lifecycle (intake, approve, reject)
│   ├── 04-work-order.js         # Work order lifecycle (create, assign, start, complete)
│   ├── 05-work-report.js        # Work report lifecycle (submit, sent, approve, reject)
│   ├── 06-dashboard.js          # Dashboard aggregation endpoints
│   ├── 07-company-admin.js      # Company management + positions + invitations
│   └── 08-services-config.js    # Services, pricing, templates, notifications, FAQ
├── reports/                     # Folder output JSON reports
├── package.json                 # Script shortcuts
├── run-all.ps1                  # PowerShell runner all scenarios + summary
└── README.md                    # Dokumentasi ini
```

---

## 3. Cara Menjalankan

### 3.1 Setup Awal (Pertama Kali)

Buka terminal di folder `test/stresstest`:

```bash
cd test/stresstest
```

Set BASE_URL environment variable:
```powershell
# PowerShell
$env:BASE_URL="https://workorder-portal.up.railway.app"

# atau set langsung di config.js
```

### 3.2 Jalankan Semua Skenario Sekaligus

```powershell
.\run-all.ps1 -BaseUrl "https://workorder-portal.up.railway.app"
```

### 3.3 Jalankan Satu Skenario Tertentu

```powershell
# Auth flow (200 VUs peak)
k6 run scenarios/01-auth.js

# Dengan output ke file JSON
k6 run --out json=reports/01-auth.json scenarios/01-auth.js

# Dengan BASE_URL kustom
k6 run -e BASE_URL="https://workorder-portal.up.railway.app" scenarios/01-auth.js
```

### 3.4 Menggunakan npm Scripts

```bash
npm run scenario:auth
npm run scenario:public
npm run scenario:sr
npm run scenario:wo
npm run scenario:wr
npm run scenario:dash
npm run scenario:company
npm run scenario:config
npm run all
```

---

## 4. Skenario & Beban

| # | Skenario | Endpoint Coverage | Peak VUs | Durasi | Fokus |
|---|----------|-------------------|----------|--------|-------|
| 01 | Auth Flow | 5 endpoint | 100 | 110s | Login spike, register concurrency |
| 02 | Public & Client | 14 endpoint | 80 | 100s | Read throughput, public APIs |
| 03 | Service Request | 8 endpoint | 50 | 90s | Write throughput, approval flow |
| 04 | Work Order | 14 endpoint | 30 | 90s | Complex stateful workflow |
| 05 | Work Report | 4 endpoint | 20 | 50s | Sequential report flow |
| 06 | Dashboard | 3 endpoint | 30 | 80s | Aggregation query performance |
| 07 | Company Admin | 19 endpoint | 20 | 90s | Mixed CRUD, role-based access |
| 08 | Services & Config | 23 endpoint | 15 | 90s | Config operations, external APIs |

**Total endpoint coverage:** ~90 endpoint unik (termasuk path alternatif)

---

## 5. Output & Report

### 5.1 Terminal Output (Real-time)

Selama test berjalan, k6 menampilkan:
```
✓ http_req_duration........: avg=245ms  p(95)=845ms  p(99)=1500ms
✓ http_reqs...............: 15234  105.2/s
✗ { error metric }........: 0.5%   ✓ 15200  ✗ 34
```

### 5.2 JSON Report

Setelah test selesai, file JSON akan tersimpan di `reports/`:
```
reports/
├── 01-auth.json
├── 02-public.json
├── 03-sr.json
├── 04-wo.json
├── 05-wr.json
├── 06-dash.json
├── 07-company.json
├── 08-config.json
└── summary.html
```

### 5.3 Summary HTML

Jalankan `run-all.ps1` untuk menghasilkan `summary.html` yang bisa dibuka di browser.

### 5.4 Visualisasi dengan Grafana (Opsional)

```powershell
# Setup InfluxDB + Grafana (docker)
docker run -d --name influxdb -p 8086:8086 influxdb
docker run -d --name grafana -p 3000:3000 grafana/grafana

# Kirim hasil ke InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 scenarios/01-auth.js

# Buka Grafana di http://localhost:3000
# Import dashboard ID: 2587 (k6 Load Testing Results)
```

---

## 6. Thresholds (Ambang Batas)

Threshold default yang digunakan:

| Metric | Threshold | Artinya |
|--------|-----------|---------|
| `http_req_duration` | `p(95)<3000` | 95% request selesai < 3 detik |
| `http_req_duration` | `p(99)<5000` | 99% request selesai < 5 detik |
| `http_req_failed` | `rate<0.02` | Error rate < 2% |

Threshold spesifik per skenario (misal dashboard):
| `dash_duration` | `p(95)<3000` | Dashboard aggregation < 3 detik |

---

## 7. Catatan Penting

### 7.1 Data Test

- Script menggunakan akun test dengan prefix `stress-*@test.com`
- **Jalankan hanya di environment test**, jangan di produksi sungguhan
- Email akun test: `stress-owner@test.com`, `stress-manager@test.com`, `stress-client01@test.com` s.d. `10`
- Password semua akun: `StressTest123!`

### 7.2 Setup Flow (helpers/setup.js)

Setup script menjalankan alur lengkap:
1. **Register owner** → `POST /auth/register-company` (buat user + company)
2. **Register staff/manager** → `POST /auth/register` sebagai `client`
3. **Owner invite staff** → `POST /company/invite` dengan `{invites: [{email, role}]}`
4. **Staff accept invitation** → `GET /invitations/pending` → `PUT /invitations/:id/accept`
5. **Re-login** → Ambil token baru yang sudah punya `companyId`
6. **Create forms** → Intake form, Report form, WO form via `POST /forms`
7. **Create position** → `POST /positions`
8. **Create service** → `POST /services` dengan referensi form + position yang valid

### 7.3 Sebelum Test

1. Pastikan rate limiting dimatikan (`THROTTLE_LIMIT=0`)
2. Pastikan MongoDB, Redis, MinIO dalam kondisi sehat
3. Jika menggunakan Railway, perhatikan resource limit (CPU/Memory)
4. Hapus data test sebelumnya jika ingin memulai fresh

### 7.3 Interpretasi Hasil

| Hasil | Kemungkinan Penyebab |
|-------|----------------------|
| p95 > 5s | Database slow query / connection pool habis / Redis bottleneck |
| Error rate > 5% | Server overwhelmed / rate limiting masih aktif / timeout |
| Throughput rendah | CPU-bound di Node.js / MongoDB aggregation heavy |
| Timeout koneksi | MinIO latency / external service (FAQ) lambat |

### 7.4 Customisasi

Untuk mengubah beban, edit bagian `stages` di setiap file scenario:
```javascript
stages: [
  { duration: '30s', target: 100 },   // Ramp up ke 100 VUs dalam 30 detik
  { duration: '2m', target: 100 },    // Hold 100 VUs selama 2 menit
  { duration: '30s', target: 0 },     // Ramp down ke 0
],
```

Untuk mengubah BASE_URL, gunakan environment variable:
```bash
k6 run -e BASE_URL="https://url-anda.com" scenarios/01-auth.js
```

---

## 8. Contoh Skenario untuk Laporan TA

Berikut rekomendasi urutan test untuk dokumentasi laporan:

| Urutan | Skenario | Tujuan |
|--------|----------|--------|
| 1 | 02-public-client | Baseline performance (endpoint paling ringan) |
| 2 | 01-auth | Authentikasi dengan concurrency tinggi |
| 3 | 06-dashboard | Aggregation query (heavy read) |
| 4 | 03-service-request | Write-heavy (intake submission) |
| 5 | 04-work-order | Complex workflow (stateful) |
| 6 | 08-services-config | Mixed CRUD+API eksternal (FAQ) |

Untuk setiap skenario, dokumentasikan:
1. **Grafik** response time distribution
2. **Tabel** perbandingan avg / p95 / p99
3. **Analisis** bottleneck yang ditemukan
4. **Rekomendasi** optimasi

---

## 9. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ERR_CONNECTION_REFUSED` | Periksa BASE_URL, pastikan server running |
| `Too Many Requests (429)` | Rate limiting masih aktif, nonaktifkan dulu |
| `JWT expired` | Token 7 hari, jika lebih dari 7 hari, jalankan ulang |
| `ECONNRESET` | Koneksi internet tidak stabil, kurangi VUs |
| Akun sudah terdaftar | Hapus manual dari database atau ganti email di config.js |
