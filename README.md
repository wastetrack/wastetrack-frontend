# WasteTrack

WasteTrack adalah aplikasi frontend berbasis Next.js untuk pengelolaan sampah.

## Instalasi

1. **Clone repository ini**
2. **Masuk ke folder frontend:**
   ```bash
   cd wastetrack-frontend
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Buat file environment:**

   Buat file .env, dengan konfigurasi seperti di bawah ini:

   ```bash
    NEXT_PUBLIC_API_URL=your_key
    NEXT_PUBLIC_OBFUSCATION_KEY=your_key
   ```

## Menjalankan Aplikasi

Jalankan server development dengan perintah berikut:

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## Fase Staging

Aplikasi ini juga tersedia pada fase staging yang dideploy di:

[https://wastetrack-staging.netlify.app](https://wastetrack-staging.netlify.app)

## Catatan

- Pastikan file `.env` sudah terisi dengan benar sebelum menjalankan aplikasi.
- Apabila ingin mengetahui environtment yang digunakan saat ini, bisa menghubungi developer WasteTrack
