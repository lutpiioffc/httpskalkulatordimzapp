NEON CALC - Kalkulator Modern (HTML + CSS + JavaScript)
=======================================================

CARA MENJALANKAN
1. Ekstrak file ZIP (di HP Android: tahan file ZIP > Ekstrak / gunakan
   aplikasi "Files by Google" atau ZArchiver).
2. Buka folder "kalkulator-neon".
3. Buka file index.html dengan Chrome / browser lain.
   - Di Android: buka Chrome > ketik di kolom alamat
     file:///storage/emulated/0/Download/kalkulator-neon/index.html
     (sesuaikan lokasi folder), atau di aplikasi Files ketuk index.html
     lalu pilih "Chrome".
   - Di komputer: klik dua kali index.html.

Tidak butuh internet, server, ataupun database.
Pastikan file index.html, style.css, dan script.js tetap berada
dalam satu folder yang sama.

FITUR
- Operasi: + - x / % (persen), x^2 (pangkat dua), akar kuadrat
- AC  : hapus semuanya
- DEL : hapus karakter terakhir
- Hasil langsung tampil saat Anda mengetik (pratinjau), tekan = untuk
  menyimpannya ke riwayat
- Riwayat perhitungan (maks. 50). Ketuk salah satu untuk memakai
  hasilnya lagi. Di HP, buka lewat ikon jam di pojok kanan atas.
- Mode gelap / terang (ikon bulan / matahari). Pilihan tema dan
  riwayat tersimpan otomatis di browser.
- Animasi tekan tombol dan efek cahaya neon.

CARA KERJA OPERATOR
- Persen: 50% = 0,5 | 200 + 10% = 220 | 200 - 10% = 180 | 200 x 10% = 20
- Pangkat dua: ketik angka lalu tekan x^2 (contoh 9 x^2 = 81)
- Akar: tekan akar lalu angka (contoh akar 16 = 4). Setelah hasil muncul,
  menekan akar akan mengakarkan hasil tersebut.
- Urutan operasi matematika berlaku (perkalian/pembagian lebih dulu).

PINTASAN KEYBOARD (komputer)
  0-9  angka          .  atau ,   desimal
  + - * /  operator   (x juga = kali)
  %    persen         ^   pangkat dua      r   akar kuadrat
  Enter atau =  hitung
  Backspace     DEL
  Esc atau Delete   AC

STRUKTUR FILE
  index.html  - kerangka halaman
  style.css   - tampilan (hitam & biru neon, responsif)
  script.js   - logika kalkulator
  README.txt  - petunjuk ini
