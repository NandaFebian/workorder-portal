# Deskripsi Endpoint Modul Invitation Code

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *invitation code*.

### 1. Membuat Kode Undangan

Penerbitan kode undangan unik dilakukan oleh pemilik atau manajer perusahaan sebagai alternatif undangan melalui surel. Konfigurasi peran dan jabatan yang dilampirkan pada permintaan inilah yang akan diterapkan kepada pengguna pada saat kode diklaim.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/company/invitation-codes` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Owner, Manager |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;"positionId":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;"maxUses":&nbsp;10,<br>&nbsp;&nbsp;"expiresInDays":&nbsp;30<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;201,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a54f1b2c2b4e81234567891",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"K7XM29AB",<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"position":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Teknisi&nbsp;lapangan"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"maxUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;"usedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"remainingUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt":&nbsp;"2026-08-12T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isClaimable":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"claimedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-07-13T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-07-13T04:12:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Jabatan (*positionId*) wajib dilampirkan untuk peran staf, sedangkan peran manajer hanya dapat diterbitkan oleh pemilik perusahaan. Kode akan dibangkitkan secara otomatis sepanjang 8 karakter apabila atribut *code* tidak diisi, sementara atribut *maxUses* dan *expiresInDays* dapat dikosongkan agar kode berlaku tanpa batas.

---
### 2. Melihat Daftar Kode Undangan

Pengambilan daftar kode undangan yang diterbitkan perusahaan dilakukan untuk keperluan pemantauan dan pengelolaan. Daftar yang dikembalikan telah disaring secara otomatis sesuai dengan batas kewenangan pengguna yang mengakses.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/company/invitation-codes` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Owner, Manager |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;codes&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a54f1b2c2b4e81234567891",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"K7XM29AB",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"position":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Teknisi&nbsp;lapangan"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"usedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remainingUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt":&nbsp;"2026-08-12T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isClaimable":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"claimedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-07-13T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-07-13T04:12:00.000Z"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Pemilik perusahaan memperoleh seluruh kode undangan, manajer umum hanya memperoleh kode berperan staf, sedangkan manajer departemen hanya memperoleh kode berperan staf pada jabatan yang dipimpinnya. Penyaringan dilakukan langsung pada kueri basis data sehingga antarmuka tidak perlu melakukan penyaringan ulang.

---
### 3. Melihat Detail Kode Undangan

Pengambilan detail konfigurasi sebuah kode undangan dilakukan berdasarkan identitas uniknya. Kode yang berada di luar batas kewenangan pengguna diperlakukan sama seperti kode yang tidak ditemukan.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/company/invitation-codes/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Owner, Manager |
| Path Parameter | `id` : ID kode undangan |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a54f1b2c2b4e81234567891",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"K7XM29AB",<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"position":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Teknisi&nbsp;lapangan"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"maxUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;"usedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"remainingUses":&nbsp;10,<br>&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt":&nbsp;"2026-08-12T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isClaimable":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"claimedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-07-13T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-07-13T04:12:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Kode di luar kewenangan pengguna dikembalikan dengan kode status 404 (*not found*), bukan 403 (*forbidden*). Perlakuan ini diterapkan secara sengaja agar manajer tidak dapat menelusuri keberadaan kode undangan yang tidak berhak diaksesnya.

---
### 4. Mengubah Konfigurasi Kode Undangan

Perubahan konfigurasi maupun status keaktifan kode undangan dilakukan tanpa perlu menerbitkan kode baru. Seluruh atribut bersifat opsional sehingga hanya atribut yang diubah saja yang perlu dikirimkan.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/company/invitation-codes/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Owner, Manager |
| Path Parameter | `id` : ID kode undangan |
| Request Body | <pre>{<br>&nbsp;&nbsp;"isActive":&nbsp;false,<br>&nbsp;&nbsp;"maxUses":&nbsp;20<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;updated&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a54f1b2c2b4e81234567891",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"K7XM29AB",<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"position":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Teknisi&nbsp;lapangan"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"maxUses":&nbsp;20,<br>&nbsp;&nbsp;&nbsp;&nbsp;"usedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"remainingUses":&nbsp;20,<br>&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt":&nbsp;"2026-08-12T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isClaimable":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"claimedCount":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-07-13T04:12:00.000Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-07-13T04:12:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Peran dan jabatan divalidasi ulang secara berpasangan sehingga perubahan sebagian tidak dapat menghasilkan konfigurasi yang tidak sah, misalnya peran staf tanpa jabatan. Nilai *maxUses* juga tidak dapat ditetapkan lebih rendah daripada jumlah klaim yang telah terjadi.

---
### 5. Mencabut Kode Undangan

Pencabutan kode undangan dilakukan apabila kode dinilai sudah tidak diperlukan atau berpotensi disalahgunakan. Kode yang dicabut seketika tidak dapat diklaim kembali oleh pengguna mana pun.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/company/invitation-codes/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Owner, Manager |
| Path Parameter | `id` : ID kode undangan |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;revoked&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a54f1b2c2b4e81234567891"<br>&nbsp;&nbsp;}<br>}</pre> |

Penghapusan dilakukan secara logis (*soft delete*) sehingga jejak audit mengenai pengguna yang telah bergabung melalui kode tersebut tetap terpelihara. Kode yang telah dicabut tidak lagi muncul pada daftar kode undangan perusahaan.

---
### 6. Melihat Pratinjau Kode Undangan

Pratinjau kode undangan disediakan agar calon pegawai dapat mengetahui perusahaan, peran, dan jabatan yang akan diperolehnya sebelum melakukan klaim. Tahap ini belum mengubah data akun pengguna sama sekali.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/invitation-codes/:code` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | `code` : kode undangan (tidak membedakan huruf besar/kecil) |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"K7XM29AB",<br>&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"position":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Teknisi&nbsp;lapangan"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt":&nbsp;"2026-08-12T04:12:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Kode yang telah dinonaktifkan, kedaluwarsa, maupun habis kuota klaimnya akan ditolak pada tahap pratinjau ini. Penyediaan pratinjau bertujuan agar pengguna dapat mengonfirmasi tujuan bergabungnya sebelum status akunnya diubah oleh sistem.

---
### 7. Mengklaim Kode Undangan

Klaim kode undangan dilakukan oleh calon pegawai untuk bergabung dengan perusahaan penerbit kode. Peran dan jabatan pengguna langsung ditetapkan sesuai konfigurasi yang melekat pada kode tersebut.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/invitation-codes/claim` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Unassigned Staff |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"code":&nbsp;"K7XM29AB"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;code&nbsp;claimed&nbsp;successfully.&nbsp;You&nbsp;have&nbsp;joined&nbsp;the&nbsp;company.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Siti",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"siti@example.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"staff_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionId":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Teknisi"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> |

Klaim hanya diperbolehkan bagi pengguna berperan *unassigned staff* yang belum berafiliasi dengan perusahaan mana pun, dan status pengguna dibaca ulang dari basis data agar token lama yang sudah usang tidak dapat dimanfaatkan. Pengurangan kuota klaim dijalankan secara atomik pada tingkat basis data sehingga klaim yang terjadi bersamaan tidak dapat melampaui batas maksimum yang ditetapkan.

