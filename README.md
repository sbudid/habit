### Pelacak Kebiasaan 🚀

Aplikasi pelacak kebiasaan yang dibangun dengan **Nuxt 4**, **Drizzle ORM**, dan **SQLite (Cloudflare D1)**. Dirancang untuk membantu Anda menetapkan dan mencapai tujuan harian.

![habit](https://raw.githubusercontent.com/zackha/habit/refs/heads/master/public/social-card.png)

---

### Fitur

- 🇮🇩 **Multi-bahasa** — Bahasa Indonesia & English, toggle di settings
- 🔐 **Login Google & GitHub** — autentikasi ganda via OAuth
- 🔔 **Notifikasi Pengingat** — pengingat harian via browser notification
- 🔥 **Streak & Statistik** — streak aktif, streak terbaik, grafik mingguan & bulanan
- 🏷️ **Kategori Kebiasaan** — Kesehatan, Produktivitas, Belajar, Keuangan, Sosial, Kreativitas
- 🎯 **Target Custom** — 7, 14, 30, 40, 90, 180, atau 365 hari per habit
- ↕️ **Drag & Drop** — urutkan kebiasaan sesuai keinginan
- 🗑️ **Soft Delete** — hapus ke biasaan, bisa dipulihkan dalam 7 hari
- 📱 **PWA & Mode Offline** — install sebagai aplikasi, berfungsi offline
- 📥 **Ekspor Data** — download progres ke JSON atau CSV
- 📅 **Kalender Heatmap** — visualisasi progres tahunan
- 🌗 **Mode Gelap/Terang** — dark/light mode
- 🖊️ **Markdown** — deskripsi kebiasaan mendukung Markdown
- 🚀 **Deploy Gratis** — Cloudflare Pages + D1 (gratis!)

---

### Stack

- **Frontend:** Nuxt 4, Vue 3, Nuxt UI, TailwindCSS
- **Backend:** Nitro (Cloudflare Workers), Drizzle ORM
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** nuxt-auth-utils (GitHub + Google OAuth)
- **State:** Pinia + @pinia/colada
- **Deploy:** Cloudflare Pages via NuxtHub

---

### Deploy ke Cloudflare (Gratis!)

#### 1. Fork & Clone

```bash
git clone https://github.com/USERNAME/habit-id.git
cd habit-id
pnpm install
```

#### 2. Setup OAuth

**GitHub:** https://github.com/settings/developers → New OAuth App
- Homepage: `https://YOUR_DOMAIN.pages.dev`
- Callback: `https://YOUR_DOMAIN.pages.dev/api/auth/github`

**Google:** https://console.cloud.google.com/apis/credentials → Create OAuth Client
- Authorized redirect URI: `https://YOUR_DOMAIN.pages.dev/api/auth/google`

#### 3. Deploy via NuxtHub

```bash
# Login ke Cloudflare
npx nuxthub login

# Deploy
npx nuxthub deploy
```

Atau via **NuxtHub Admin**: https://admin.hub.nuxt.com → connect repo GitHub → deploy otomatis.

#### 4. Set Environment Variables

Di NuxtHub Admin → Settings → Environment Variables:

```
NUXT_OAUTH_GITHUB_CLIENT_ID=xxx
NUXT_OAUTH_GITHUB_CLIENT_SECRET=xxx
NUXT_OAUTH_GOOGLE_CLIENT_ID=xxx
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=xxx
NUXT_SESSION_PASSWORD=min-32-karakter-random
```

#### 5. Jalankan Migrasi Database

```bash
# Via NuxtHub CLI
npx nuxthub database migrate

# Atau via dashboard NuxtHub
```

---

### Development Lokal

```bash
# Install dependensi
pnpm install

# Jalankan dev server
pnpm dev

# Generate migrasi database
pnpm db:generate
```

---

### Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

Based on [zackha/habit](https://github.com/zackha/habit) by Sefa Bulak.
