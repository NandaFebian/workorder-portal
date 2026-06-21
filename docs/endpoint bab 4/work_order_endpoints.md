# Deskripsi Endpoint Modul Work Order

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *work order*.

### 1. Mengambil Seluruh Perintah Kerja Internal

Pengambilan seluruh daftar perintah kerja aktif di bawah naungan perusahaan dilakukan untuk keperluan pemantauan kinerja operasional. Token otorisasi JWT wajib dilampirkan oleh staf internal yang terautentikasi.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/workorders` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Load&nbsp;data&nbsp;success",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4a6b3d62e70195bfe1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"WO-KEW0K3CE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"serviceRequestId":&nbsp;"6a27fc466b3d62e70195bfc7",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"configId":&nbsp;"6e89ad08-c7bb-43be-af59-eb85ce1434a9",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"service":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a228729b265a11d8ca747c5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Layanan&nbsp;Pemasangan&nbsp;Jaringan&nbsp;Internet",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Layanan&nbsp;ini&nbsp;merupakan&nbsp;pemasangan&nbsp;jaringan&nbsp;internet&nbsp;mulai&nbsp;dari&nbsp;pemasangan&nbsp;tiang,&nbsp;kabel,&nbsp;router,&nbsp;LAN&nbsp;dan&nbsp;barang&nbsp;penting&nbsp;lainnya",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"accessType":&nbsp;"public",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderApprovalAccessType":&nbsp;"auto",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"positionsOnDuty":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"minStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"assignedStaff":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c29fa7bdad3a940c3dec",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Staff&nbsp;3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang3@staff.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"staffPIC":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"approved",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"has_issue":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"issue_note":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"draftedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"sentAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"rejectedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"startedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"completedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"failedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cancelledAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderForm":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"submissions":&nbsp;[]<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fb76b38f7b06d56e5ec5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"WO-DUZCMRZA",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"serviceRequestId":&nbsp;"6a27fb76b38f7b06d56e5eab",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"configId":&nbsp;"6e89ad08-c7bb-43be-af59-eb85ce1434a9",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"service":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a228729b265a11d8ca747c5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Layanan&nbsp;Pemasangan&nbsp;Jaringan&nbsp;Internet",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Layanan&nbsp;ini&nbsp;merupakan&nbsp;pemasangan&nbsp;jaringan&nbsp;internet&nbsp;mulai&nbsp;dari&nbsp;pemasangan&nbsp;tiang,&nbsp;kabel,&nbsp;router,&nbsp;LAN&nbsp;dan&nbsp;barang&nbsp;penting&nbsp;lainnya",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"accessType":&nbsp;"public",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderApprovalAccessType":&nbsp;"auto",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"positionsOnDuty":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"minStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"assignedStaff":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c29fa7bdad3a940c3dec",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Staff&nbsp;3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang3@staff.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"staffPIC":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"approved",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"has_issue":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"issue_note":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"draftedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"sentAt":&nbsp;"2026-06-09T11:39:34.761Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedAt":&nbsp;"2026-06-09T11:39:34.761Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"rejectedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"startedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"completedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"failedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cancelledAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:39:34.777Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T11:39:34.777Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderForm":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"submissions":&nbsp;[]<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a25c0cdb38f7b06d56e5713",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"WO-QWWPIMVR",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"serviceRequestId":&nbsp;"6a25c0cdb38f7b06d56e56f9",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"configId":&nbsp;"6e89ad08-c7bb-43be-af59-eb85ce1434a9",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"service":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a228729b265a11d8ca747c5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Layanan&nbsp;Pemasangan&nbsp;Jaringan&nbsp;Internet",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Layanan&nbsp;ini&nbsp;merupakan&nbsp;pemasangan&nbsp;jaringan&nbsp;internet&nbsp;mulai&nbsp;dari&nbsp;pemasangan&nbsp;tiang,&nbsp;kabel,&nbsp;router,&nbsp;LAN&nbsp;dan&nbsp;barang&nbsp;penting&nbsp;lainnya",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"accessType":&nbsp;"public",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderApprovalAccessType":&nbsp;"auto",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"positionsOnDuty":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"minStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"assignedStaff":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c29fa7bdad3a940c3dec",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Staff&nbsp;3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang3@staff.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"staffPIC":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"approved",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"has_issue":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"issue_note":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"draftedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"sentAt":&nbsp;"2026-06-07T19:04:45.669Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"approvedAt":&nbsp;"2026-06-07T19:04:45.669Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"rejectedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"startedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"completedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"failedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cancelledAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-07T19:04:45.683Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T19:04:45.683Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"workOrderForm":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"submissions":&nbsp;[]<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Penampilan seluruh daftar perintah kerja aktif difasilitasi melalui endpoint pada tabel di atas untuk menampilkan seluruh daftar perintah kerja aktif di bawah naungan perusahaan. Autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna menyaring data sesuai hak akses staf internal. Panel monitoring dashboard admin internal dimuati data perintah kerja untuk keperluan pemantauan kinerja operasional.

---

### 2. Mengambil Detail Perintah Kerja Internal

Pencarian detail data lengkap dari satu dokumen perintah kerja internal diproses dengan menyertakan parameter ID unik pada rute pemanggilan. Otorisasi token diperiksa guna mencegah kebocoran informasi tugas ke pihak luar.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/workorders/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Load&nbsp;data&nbsp;success",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4a6b3d62e70195bfe1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"WO-KEW0K3CE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"serviceRequestId":&nbsp;"6a27fc466b3d62e70195bfc7",<br>&nbsp;&nbsp;&nbsp;&nbsp;"configId":&nbsp;"6e89ad08-c7bb-43be-af59-eb85ce1434a9",<br>&nbsp;&nbsp;&nbsp;&nbsp;"service":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a228729b265a11d8ca747c5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Layanan&nbsp;Pemasangan&nbsp;Jaringan&nbsp;Internet",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Layanan&nbsp;ini&nbsp;merupakan&nbsp;pemasangan&nbsp;jaringan&nbsp;internet&nbsp;mulai&nbsp;dari&nbsp;pemasangan&nbsp;tiang,&nbsp;kabel,&nbsp;router,&nbsp;LAN&nbsp;dan&nbsp;barang&nbsp;penting&nbsp;lainnya",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"accessType":&nbsp;"public",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvedBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"workOrderApprovalAccessType":&nbsp;"auto",<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionsOnDuty":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"minStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"maxStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"assignedStaff":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c29fa7bdad3a940c3dec",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Staff&nbsp;3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang3@staff.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;"staffPIC":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"approved",<br>&nbsp;&nbsp;&nbsp;&nbsp;"has_issue":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"issue_note":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"draftedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"sentAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvedAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"rejectedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"startedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"completedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"failedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"cancelledAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"workOrderForm":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"submissions":&nbsp;[]<br>&nbsp;&nbsp;}<br>}</pre> |

Pencarian detail data lengkap perintah kerja internal difasilitasi melalui endpoint pada tabel di atas untuk mencari detail data lengkap dari satu dokumen perintah kerja internal. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mencegah kebocoran informasi tugas ke pihak luar. Perkembangan tugas lapangan ditinjau oleh operator sistem berdasarkan objek detail dokumen yang dikirimkan.

---



### 3. Menugaskan Staf ke Perintah Kerja

Penugasan staf penanggung jawab lapangan (*PIC*) dan anggota staf pelaksana ke dokumen perintah kerja tertentu diproses melalui pengiriman surel staf pada badan permintaan. Otorisasi peran manajer atau pemilik diperiksa untuk membatasi kewenangan penugasan ini.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/workorders/:id/assign-staffs` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | <pre>{<br>&nbsp;&nbsp;"staff_pic":&nbsp;"ledang1@staff.com",<br>&nbsp;&nbsp;"assign_staffs":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;"ledang1@staff.com"<br>&nbsp;&nbsp;]<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Staff&nbsp;assigned&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4a6b3d62e70195bfe1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"WO-KEW0K3CE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"serviceRequestId":&nbsp;"6a27fc466b3d62e70195bfc7",<br>&nbsp;&nbsp;&nbsp;&nbsp;"configId":&nbsp;"6e89ad08-c7bb-43be-af59-eb85ce1434a9",<br>&nbsp;&nbsp;&nbsp;&nbsp;"service":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a228729b265a11d8ca747c5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Layanan&nbsp;Pemasangan&nbsp;Jaringan&nbsp;Internet",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Layanan&nbsp;ini&nbsp;merupakan&nbsp;pemasangan&nbsp;jaringan&nbsp;internet&nbsp;mulai&nbsp;dari&nbsp;pemasangan&nbsp;tiang,&nbsp;kabel,&nbsp;router,&nbsp;LAN&nbsp;dan&nbsp;barang&nbsp;penting&nbsp;lainnya",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"accessType":&nbsp;"public",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvedBy":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"workOrderApprovalAccessType":&nbsp;"auto",<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionsOnDuty":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"minStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"maxStaff":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"assignedStaff":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c29fa7bdad3a940c3dec",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Staff&nbsp;3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang3@staff.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;"staffPIC":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang1@staff.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"approved",<br>&nbsp;&nbsp;&nbsp;&nbsp;"has_issue":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"issue_note":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"draftedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"sentAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvedAt":&nbsp;"2026-06-09T11:43:05.484Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"rejectedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"startedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"completedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"failedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"cancelledAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T11:43:06.531Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"workOrderForm":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"submissions":&nbsp;[]<br>&nbsp;&nbsp;}<br>}</pre> |

Penugasan staf penanggung jawab lapangan dan anggota staf pelaksana difasilitasi melalui endpoint pada tabel di atas untuk menugaskan staf penanggung jawab lapangan dan anggota staf pelaksana ke dokumen perintah kerja tertentu. Path Parameter id dan Request Body berisi staff_pic serta assign_staffs diperlukan dengan autentikasi JWT Token serta role Company Owner dan Company Manager untuk membatasi kewenangan penugasan. Informasi staf terlampir dikembalikan kepada pengguna sebagai konfirmasi penugasan resmi di database.

---

### 4. Menyimpan Draf Jawaban Lapangan

Penyimpanan draf isian formulir lapangan oleh staf pelaksana dijalankan dengan mengirimkan data masukan dinamis ke peladen. Token otorisasi JWT wajib disertakan oleh staf penanggung jawab tugas terkait.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/workorders/:id/submissions` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | <pre>{<br>&nbsp;&nbsp;"formId":&nbsp;"6a228552b265a11d8ca74720",<br>&nbsp;&nbsp;"fieldsData":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value":&nbsp;"kabel&nbsp;terpasang"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Submissions&nbsp;saved&nbsp;successfully"<br>}</pre> |

Penyimpanan draf isian formulir lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyimpan draf isian formulir lapangan oleh staf pelaksana yang sedang bertugas. Path Parameter id dan Request Body berisi formId serta fieldsData diperlukan dengan autentikasi JWT Token serta role Company Owner, Company Manager, dan Company Staff guna memastikan hanya staf penanggung jawab yang dapat menyimpan data. Fleksibilitas pencatatan progres lapangan ditingkatkan melalui penyimpanan sementara data masukan dinamis sebagai draf pekerjaan.

---

### 5. Mengirimkan Laporan Perintah Kerja (Sent)

Pengiriman laporan hasil pekerjaan dari lapangan ke jajaran manajemen diproses dengan mengirimkan parameter ID perintah kerja rute. Token otorisasi JWT staf pelaksana diverifikasi guna mengesahkan serah terima tugas.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/sent` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;marked&nbsp;as&nbsp;sent"<br>}</pre> |

Pengiriman laporan hasil pekerjaan dari lapangan difasilitasi melalui endpoint pada tabel di atas untuk mengirimkan laporan hasil pekerjaan dari lapangan ke jajaran manajemen perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mengesahkan serah terima tugas staf pelaksana. Notifikasi penyerahan tugas diteruskan ke sistem monitoring manajer untuk ditindaklanjuti.

---

### 6. Menyetujui Perintah Kerja (Approve)

Persetujuan hasil penyelesaian pekerjaan atas perintah kerja lapangan dilakukan oleh pengelola perusahaan. Verifikasi token JWT manajerial diterapkan guna mencegah penyetujuan laporan sepihak dari luar manajemen.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/approve` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;approved"<br>}</pre> |

Persetujuan hasil penyelesaian pekerjaan atas perintah kerja lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyetujui hasil penyelesaian pekerjaan atas perintah kerja lapangan oleh pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mencegah penyetujuan laporan sepihak dari luar manajemen. Konfirmasi persetujuan dikirimkan kembali ke antarmuka manajer sebagai tanda penuntasan berkas.

---

### 7. Menolak Perintah Kerja (Reject)

Penolakan hasil pengerjaan perintah kerja lapangan diproses oleh pengelola dengan melampirkan parameter ID rute terkait. Token otorisasi JWT manajer diverifikasi guna mengembalikan status kerja ke tahap draf.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/reject` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;rejected"<br>}</pre> |

Penolakan hasil pengerjaan perintah kerja lapangan difasilitasi melalui endpoint pada tabel di atas untuk menolak hasil pengerjaan perintah kerja lapangan oleh pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mengembalikan status kerja ke tahap draf. Riwayat penolakan dicatat dan notifikasi perbaikan dikirimkan kepada staf pelaksana untuk tindak lanjut.

---

### 8. Membuat Ulang Perintah Kerja

Pembuatan ulang perintah kerja yang gagal atau ditolak dijalankan oleh pengelola dengan mengirimkan parameter ID rute perintah kerja lama. Otorisasi peran manajer atau pemilik diverifikasi guna menjamin validitas berkas kerja baru.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/workorders/:id/recreate` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;recreated"<br>}</pre> |

Pembuatan ulang perintah kerja yang gagal atau ditolak difasilitasi melalui endpoint pada tabel di atas untuk membuat ulang perintah kerja yang gagal atau ditolak oleh pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna menjamin validitas berkas kerja baru yang dihasilkan. ID perintah kerja baru yang sukses tersimpan dikembalikan sebagai respon pemrosesan penggantian berkas lama.

---

### 9. Pembatalan Perintah Kerja

Pembatalan pelaksanaan perintah kerja yang sedang berjalan diproses oleh pengelola dengan melampirkan parameter ID rute terkait. Token otorisasi JWT manajer atau pemilik diperlukan untuk memvalidasi pembatalan tugas lapangan.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/cancel` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;cancelled"<br>}</pre> |

Pembatalan pelaksanaan perintah kerja yang sedang berjalan difasilitasi melalui endpoint pada tabel di atas untuk membatalkan pelaksanaan perintah kerja yang sedang berjalan oleh pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna memvalidasi pembatalan tugas lapangan. Notifikasi pembatalan tugas diteruskan ke staf pelaksana lapangan sebagai pemberitahuan resmi.

---

### 10. Memulai Pengerjaan Perintah Kerja (Start)

Menandai dimulainya pelaksanaan pengerjaan tugas di lapangan dijalankan oleh staf pelaksana dengan melampirkan parameter ID rute terkait. Otorisasi token JWT staf diverifikasi guna mencatat waktu mulai kerja lapangan.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/start` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;started"<br>}</pre> |

Penandaan dimulainya pelaksanaan pengerjaan tugas di lapangan difasilitasi melalui endpoint pada tabel di atas untuk menandai dimulainya pelaksanaan pengerjaan tugas di lapangan oleh staf pelaksana. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mencatat waktu mulai kerja lapangan secara akurat. Stempel waktu mulai kerja dicatat dan dikembalikan sebagai konfirmasi respon sukses kepada staf.

---

### 11. Menandai Selesai Pekerjaan (Complete)

Menyatakan penyelesaian pelaksanaan tugas pengerjaan di lapangan dijalankan dengan mengirimkan data deskripsi masalah. Token otorisasi JWT staf penanggung jawab diverifikasi guna mencatat laporan penyelesaian.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/complete` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | <pre>{<br>&nbsp;&nbsp;"issue":&nbsp;"Kerusakan&nbsp;selesai&nbsp;diperbaiki&nbsp;dengan&nbsp;mengganti&nbsp;komponen&nbsp;baru"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;completed"<br>}</pre> |

Pernyataan penyelesaian pelaksanaan tugas pengerjaan di lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyatakan penyelesaian pelaksanaan tugas pengerjaan di lapangan oleh staf penanggung jawab. Path Parameter id dan Request Body berisi issue diperlukan dengan autentikasi JWT Token serta role Company Owner, Company Manager, dan Company Staff guna mencatat laporan penyelesaian. Laporan akhir dikirimkan ke tingkat manajemen untuk proses peninjauan berkas hasil pekerjaan.

---

### 12. Menandai Gagal Pekerjaan (Fail)

Menyatakan kegagalan dalam pelaksanaan pengerjaan tugas lapangan diproses dengan melampirkan deskripsi alasan kegagalan. Otorisasi token JWT staf lapangan diverifikasi guna menghentikan alur kerja penugasan terkait.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workorders/:id/fail` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | <pre>{<br>&nbsp;&nbsp;"issue":&nbsp;"Alat&nbsp;penunjang&nbsp;utama&nbsp;rusak&nbsp;di&nbsp;lapangan"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;Order&nbsp;failed"<br>}</pre> |

Pernyataan kegagalan dalam pelaksanaan pengerjaan tugas lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyatakan kegagalan dalam pelaksanaan pengerjaan tugas lapangan oleh staf yang bertugas. Path Parameter id dan Request Body berisi issue diperlukan dengan autentikasi JWT Token serta role Company Owner, Company Manager, dan Company Staff guna menghentikan alur kerja penugasan terkait. Deskripsi alasan kegagalan dicatat untuk kebutuhan evaluasi operasional manajemen perusahaan.

---

### 13. Mengambil Dokumen Laporan Perintah Kerja

Pembacaan berkas laporan hasil akhir pekerjaan yang terikat dengan perintah kerja dilakukan oleh staf internal perusahaan. Token otorisasi JWT wajib disertakan untuk memvalidasi hak pengaksesan berkas.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/workorders/:id/report` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcc |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"report":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4b6b3d62e70195bfcd",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"drafted"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"meta":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"fillable":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Pembacaan berkas laporan hasil akhir pekerjaan difasilitasi melalui endpoint pada tabel di atas untuk membaca berkas laporan hasil akhir pekerjaan yang terikat dengan perintah kerja oleh staf internal. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna memvalidasi hak pengaksesan berkas laporan. Muat ulang draf data laporan lapangan oleh staf internal difasilitasi melalui penyajian berkas data laporan hasil kerja yang valid.

---


