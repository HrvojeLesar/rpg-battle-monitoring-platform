---
title: Izrada platforme za praćenje bitke u igri igranja uloga
author: Hrvoje Lesar
theme:
    override:
        footer:
            style: template
            right: "{current_slide}"
---

Sadržaj
--

<!-- font_size: 2 -->

1. Igre igranja uloga
2. Dungeons & Dragons
3. Arhitektura platforme
4. Demonstracija

<!-- end_slide -->

Igre igranja uloga
---

- Spoj priče, izvedbe i igre
    - Igrači zajednički stvaraju, imaju utjecaj i nastanjuju zamišljeni svijet
vođen kombinacijom strukturiranih pravila i pripovijedanja
- Razvijene iz ratnih igara
    - U početku su ratne igre korištene za obuku časnika
    - Više usredotočene na sukob između dva ili više igrača

<!-- end_slide -->

Dungeons & Dragons
---

- Nastala 1974. godine
    - Stekla veliku popularnost
    - Odvaja se od ratnih igara dopuštajući svakom igraču da stvori
vlastiti lik umjesto vojne formacije
<!-- pause -->
- Izrađena platforma djelomično implementira ovaj sustav
    - Character sheet
    - Glavna pravila borbe
<!-- pause -->
- Borba
    - U borbu može biti uključeno više likova
    - Odvija se u potezima
    - Svaki lik ima određeni broj akcija koje može napraviti tokom svog poteza

<!-- end_slide -->

Arhitektura platforme
---
<!-- 
speaker_note: | 
- Napisan kao rust biblioteka za lakše embedanje
    Aplikacija se može kompajlirati i bundlati kao
    desktop ili mobilna aplikacija.
- Jednostavan protokol za razmjenu i sinkronizaciju podataka
    Nakon što klijent napravi neku promjenu, npr. pomakne token,
    kreira novi token, učita sliku, uz to šalje poruku poslužitelju
    da je potrebno te informacije spremiti/ažurirati i proslijediti
    ih drugim klijentima
-->

- Klijent <-> poslužitelj arhitektura
- Poslužitelj
    - Omogućava komunikaciju između klijenata
    - Pohranjuje stanje igre
    - Omogućava učitavanje slika
    - Napisan kao rust biblioteka za lakše embedanje
    - Jednostavan protokol za razmjenu i sinkronizaciju podataka
<!-- pause -->
- Klijent
    - Web aplikacija
    - Korisničko sučelje
    - Razmjena podataka u realnom vremenu kroz websocket
    - Sadrži svu logiku i implementirana pravila igre
    - Dvije vrste "pogleda"
        - DM - ima pristup svim podacima
        - Igrač - neki podaci su sakriveni

<!-- end_slide -->

<!-- jump_to_middle -->

Demonstracija
---
