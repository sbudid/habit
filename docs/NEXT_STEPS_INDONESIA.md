# Rutina — Indonesia Habit App Patch

Patch ini mengubah feel aplikasi dari habit tracker generic menjadi MVP lokal bernama **Rutina**.

## Yang diubah

- Landing page jadi bahasa Indonesia dengan angle keluarga.
- SEO metadata diganti ke `Rutina — Habit Keluarga Indonesia`.
- Tombol dan empty state diterjemahkan.
- Form tambah habit diberi preset lokal:
  - Sholat tepat waktu
  - Minum air putih
  - Belajar anak 20 menit
  - Olahraga ringan
- Footer dibersihkan dari credit original repo.
- Tanggal dashboard dibuat bahasa Indonesia.

## Cara pakai

Copy isi folder patch ini ke root repo `habit`, replace file yang sama:

```bash
cp -r app docs /path/ke/repo/habit/
```

Lalu jalankan:

```bash
pnpm install
pnpm dev
```

## Deploy Cloudflare / NuxtHub

Repo ini masih memakai GitHub OAuth dan NuxtHub D1. Untuk MVP pribadi, biarkan dulu.

Minimal env yang perlu disiapkan:

```bash
NUXT_OAUTH_GITHUB_CLIENT_ID=xxx
NUXT_OAUTH_GITHUB_CLIENT_SECRET=xxx
NUXT_SESSION_PASSWORD=minimal_32_karakter_random
```

## Next step kalau mau dijual Indonesia

1. Ganti auth GitHub menjadi Google/email login.
2. Tambah table subscription / plan.
3. Tambah batas free plan, misalnya 3 habit aktif.
4. Tambah mode keluarga: parent + member anak/pasangan.
5. Tambah reminder WhatsApp/email.
6. Tambah landing pricing:
   - Free: 3 habit aktif
   - Personal: Rp19.000–29.000/bulan
   - Family: Rp49.000–69.000/bulan
   - Lifetime early bird: Rp99.000–149.000

## Catatan

Ini belum mengubah database schema supaya patch aman dan nggak langsung merusak data/migration. Kalau MVP pribadi sudah oke, baru lanjut auth + subscription.
