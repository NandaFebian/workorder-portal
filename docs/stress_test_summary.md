# Kesimpulan Stress Test — WorkOrder-Service

**Tanggal:** 17 Juni 2026 | **Environment:** Production | **Tool:** k6 (100 VUs, 30s ramp-up)

| Skenario | Requests | Error Rate | Avg (ms) | Max (ms) | Throughput (/s) |
|---|---:|---:|---:|---:|---:|
| Public Endpoints | 7,213 | 0% | 243.87 | 2,230 | 192.38 |
| Client Endpoints | 6,005 | 0% | 238.99 | 562 | 150.96 |
| Operations (SR/WO/WR) | 4,002 | 0% | 251.66 | 554 | 119.59 |
| Company & Admin | 18,001 | 0% | 272.83 | 833 | 200.71 |
| Services & Config | 20,001 | 0% | 320.37 | 1,480 | 184.54 |
| Dashboard | 6,001 | 0% | 243.24 | 439 | 198.24 |
| **Total** | **61,223** | **0%** | **277.35** | **2,230** | **1,046.42** |

**Hasil: 61,223 requests — 0% error — avg 277ms ✅**
