# Rutina MVP Auth Notes

Patch ini menambahkan login cepat via nama + email.

## Kenapa dibuat begini?

GitHub login enak untuk developer, tapi kurang cocok untuk target Indonesia umum. Login cepat ini membuat istri, teman, atau tester bisa masuk tanpa akun GitHub.

## Penting

Ini belum auth production.

Mode ini cocok untuk:

- testing pribadi
- demo awal
- validasi UI/UX
- share terbatas ke orang dekat

Belum cocok untuk:

- jualan public
- data sensitif
- paid users beneran
- production SaaS skala besar

## Next step production

Pilih salah satu:

1. Supabase Auth email/password + Google login
2. Nuxt Auth Utils + OAuth Google
3. Cloudflare Access untuk private/internal only

Untuk versi Indonesia yang mau dijual, rekomendasi paling praktis: Supabase Auth + app tetap di Cloudflare.
