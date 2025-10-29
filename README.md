<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# Work Order Portal - Backend

Ini adalah backend untuk aplikasi **Work Order Portal** yang dibangun menggunakan framework **NestJS**. Aplikasi ini dirancang untuk mengelola perusahaan, pengguna, layanan, formulir, dan alur kerja terkait.

---

## ✨ Fitur Utama

* **Autentikasi & Otorisasi:** Registrasi pengguna (Client, Staff), registrasi perusahaan beserta pemiliknya, login, logout, pengambilan profil pengguna. Menggunakan token-based authentication dan role-based access control (RBAC).
* **Manajemen Perusahaan:** Pembuatan perusahaan baru, update informasi perusahaan, pengelolaan karyawan (undangan, daftar karyawan), endpoint publik untuk melihat perusahaan dan layanannya.
* **Manajemen Pengguna & Role:** Pengelolaan pengguna dengan role berbeda (Client, App Admin, Company Owner, Company Manager, Company Staff, Unassigned Staff).
* **Manajemen Posisi:** Pembuatan, pembaruan, penghapusan, dan pengambilan daftar posisi (global dan spesifik perusahaan). Seeder untuk posisi default.
* **Manajemen Layanan (Services):**
    * Pembuatan dan pembaruan layanan dengan sistem versi (`__v`).
    * Asosiasi formulir (Intake, Work Order, Report) ke layanan dengan urutan dan kontrol akses berbasis role/posisi.
    * Pengelolaan staf yang dibutuhkan untuk setiap layanan.
    * Endpoint internal untuk manajemen layanan (CRUD) dan endpoint publik untuk melihat detail layanan dan formulir intake.
    * Helper agregasi MongoDB untuk pengambilan data layanan yang efisien dan terstruktur.
* **Manajemen Formulir (Forms):**
    * Pembuatan template formulir dinamis (Intake, Work Order, Report) dengan berbagai tipe field (teks, angka, pilihan, dll.).
    * Pembaruan template formulir dengan sistem versi menggunakan `formKey` dan `__v`.
    * Pengajuan (submission) formulir oleh pengguna terautentikasi dan pengguna publik (untuk intake form).
* **Struktur Respons Standar:** Menggunakan Interceptor untuk format respons sukses yang konsisten dan Filter untuk menangani exception dan format respons error (termasuk validasi).
* **Validasi Input:** Menggunakan `class-validator` dan `ValidationPipe` global untuk memastikan integritas data DTO.
* **Konfigurasi:** Menggunakan `@nestjs/config` untuk manajemen variabel lingkungan.

---

## 🛠️ Tech Stack

* **Framework:** NestJS ([@nestjs/core](https://github.com/nestjs/nest))
* **Bahasa:** TypeScript
* **Database:** MongoDB
* **ODM:** Mongoose ([@nestjs/mongoose](https://github.com/nestjs/mongoose))
* **Validasi:** class-validator, class-transformer
* **Autentikasi:** bcrypt (hashing password), token-based (custom implementation using UUID)
* **Linting/Formatting:** ESLint, Prettier

---

## 🚀 Instalasi & Setup Proyek

```bash
# Clone repositori
git clone <URL_REPOSITORI_ANDA>
cd workorder-portal-backend # atau nama direktori Anda

# Install dependensi
npm install

# Setup variabel lingkungan
# Buat file .env di root proyek dan tambahkan variabel yang dibutuhkan, contohnya:
# MONGO_URI=mongodb://username:password@host:port/database_name
# PORT=3000 # Opsional, default 3000