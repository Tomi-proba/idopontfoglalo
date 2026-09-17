# Cetli

Egyedi, testreszabott időpontfoglaló + emlékeztető rendszer kisvállalkozásoknak
(fodrász, borbély, kozmetikus, körmös, masszőr, magánrendelő stb.). Létszám
alapú árazás (3.000 Ft/hó/fő), 14 napos ingyenes próbaidő, önkiszolgáló
regisztráció.

## Stack

- **Next.js 16** (App Router, Server Actions) + **Tailwind CSS v4**
- **Supabase** — Postgres adatbázis, Auth (jelszavas + email-linkes belépés), RLS
- **Resend** — emlékeztető és próbaidő-lejárati emailek
- **Vercel Cron** — ütemezett emlékeztető-küldés és próbaidő-figyelés

## Helyi fejlesztés

```bash
npm install
cp .env.example .env.local   # töltsd ki az alábbi lépések szerint
npm run dev
```

## 1. Supabase projekt létrehozása

1. Hozz létre egy új projektet a [supabase.com](https://supabase.com) oldalon.
2. Futtasd le a `supabase/migrations/0001_init.sql` fájlt a Supabase Dashboard
   **SQL Editor**-jában (vagy a Supabase CLI-vel: `supabase db push`). Ez hozza
   létre az összes táblát (businesses, employees, appointments stb.) és a
   Row Level Security szabályokat.
3. A **Project Settings → API** oldalról másold ki:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` kulcs → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` kulcs → `SUPABASE_SERVICE_ROLE_KEY` (**soha** ne kerüljön
     kliens oldali kódba — csak a cron job-ok és a visszaigazolás-endpoint
     használja, szerver oldalon)
4. **Authentication → URL Configuration**: add hozzá a `Redirect URLs` közé
   a `http://localhost:3000/auth/callback` és az éles domained
   `https://<domained>/auth/callback` címeket.
5. **Authentication → Sign In / Providers → Email**: itt dől el, hogy a
   jelszavas regisztráció után a felhasználó **azonnal** bejut-e az admin
   felületre:
   - **"Confirm email" KIKAPCSOLVA** → a regisztráció után rögtön létrejön a
     munkamenet, a felhasználó azonnal a saját admin felületén landol (ez
     illik legjobban az "önkiszolgáló, nem kell várni" ígérethez).
   - **"Confirm email" BEKAPCSOLVA** → a felhasználónak meg kell erősítenie
     az email címét, mielőtt bejutna. Az alkalmazás ezt is lekezeli (a
     regisztrációs form ilyenkor egy "ellenőrizd a postafiókod" üzenetet mutat),
     de ez már nem "azonnali" élmény.

## 2. Resend

1. Regisztrálj a [resend.com](https://resend.com) oldalon (ingyenes tier
   bőven elég induláshoz).
2. Hozz létre egy API kulcsot → `RESEND_API_KEY`.
3. Ha van saját domained, ellenőriztesd (verify) Resend-nél, és állítsd be
   `REMINDER_FROM_EMAIL="Cetli <emlekezteto@sajat-domain.hu>"`. Domain
   nélkül a Resend sandbox feladóját (`onboarding@resend.dev`) használhatod
   teszteléshez, de éles ügyfeleknek szükséges a saját, ellenőrzött domain.

## 3. Vercel deploy

1. Kösd össze a GitHub repót egy Vercel projekttel.
2. Add meg a környezeti változókat (Project Settings → Environment
   Variables) a `.env.example` alapján, plusz:
   - `NEXT_PUBLIC_APP_URL` = az éles domain (pl. `https://cetli.hu`)
   - `CRON_SECRET` = egy általad generált random string — ez védi a
     `/api/cron/*` végpontokat illetéktelen hívás ellen.
3. A `vercel.json` két ütemezett feladatot tartalmaz, mindkettő **naponta
   egyszer** fut (07:00 és 08:00 UTC) — ez szándékos: a Vercel **Hobby
   (ingyenes)** csomag a beépített Cron Jobs-nál csak napi egyszeri
   futtatást enged, bármi sűrűbb schedule-lal a deploy hibát dob és Pro
   csomagra váltást kérne. Nem kell fizetős csomagra váltanod ahhoz, hogy
   kipróbáld az alkalmazást.

   **Ha most csak ki akarod próbálni:** nem kell várnod a napi cron-ra —
   hívd meg kézzel a végpontot (böngészőben vagy `curl`-lal):

   ```
   curl -H "Authorization: Bearer <CRON_SECRET>" \
     https://<domained>/api/cron/send-reminders
   ```

   Ez lefuttatja pontosan azt, amit a cron is futtatna: megkeresi az
   esedékes emlékeztetőket, és kiküldi őket Resenden keresztül. Ha
   `CRON_SECRET`-et nem állítottál be Vercel-en, a fejléc elhagyható.

   **Ha később éles, 15 percenkénti automatikus küldést szeretnél** —
   szintén ingyenesen, Vercel Pro nélkül —, használj egy külső ütemezőt,
   pl. [cron-job.org](https://cron-job.org): állíts be nála egy 15
   percenkénti GET hívást a `https://<domained>/api/cron/send-reminders`
   címre, az `Authorization: Bearer <CRON_SECRET>` fejléccel. Ez a Vercel
   cron-limittől független, mert nem a Vercel, hanem a cron-job.org hívja
   meg az endpointot — a `vercel.json`-beli napi cronokat megtarthatod
   tartalék/biztonsági hálóként.

## Mappastruktúra

```
app/
  page.tsx                    # landing oldal (demó, árkalkulátor, regisztráció)
  bejelentkezes/               # visszatérő felhasználók belépése
  auth/callback/                # Supabase Auth redirect (magic link, email megerősítés)
  megerosites/[token]/          # ügyfél-oldali igen/nem visszaigazolás
  admin/
    naptar/                    # napi nézet, új időpont felvétele
    ugyfelek/                  # ügyféllista, visszatérő ügyfelek
    dolgozok/                  # dolgozói naptárak kezelése (employee_count-ig)
    beallitasok/                # cégnév, emlékeztető sablon, nyitvatartás, zárvatartás
  api/
    confirm/[token]/            # igen/nem linkek célja (service-role írás)
    cron/
      send-reminders/           # esedékes emlékeztetők kiküldése
      check-trials/              # próbaidő-lejárat figyelmeztetés
lib/
  supabase/                     # kliens (böngésző/szerver/service-role) + session-frissítés
  actions/                      # Server Actions (auth, appointments, employees, settings, closures)
  reminders/                    # {név}/{időpont}/{szolgáltatás} szöveg-behelyettesítés
  email/                        # Resend wrapper
  billing/                      # létszám-alapú árszámítás, próbaidő-számolás
  time.ts                       # időzóna-konverzió (helyi idő ↔ UTC timestamptz)
supabase/migrations/0001_init.sql
```

## Amit ez az MVP tud

- Önkiszolgáló regisztráció (jelszó vagy email-link), csapatméret megadásával
- 14 napos próbaidő, lejárat előtti figyelmeztető email és admin-banner
- Naptár (napi nézet), új időpont felvétele, dolgozónkénti naptár a
  csapatméretig
- Nyitvatartás és szabadság/zárvatartás beállítása (cég szinten)
- Egyedi, szabadon szerkeszthető emlékeztető-sablon élő előnézettel
- Automatikus emlékeztető email (Resend), igen/nem egy-kattintásos
  visszaigazolás
- Ügyféllista visszatérő ügyfelek jelölésével

## Amin még dolgozni kell (a séma már felkészült rá)

- Automatikus várólista-kitöltés (`waitlist` tábla kész, a lemondás→ajánlás
  automatizmus még nincs megírva)
- Visszatérő ügyfél-emlékeztető
- Értékelés-kérés + dolgozónkénti csillagozás (`review_requests` tábla kész)
- Havi/dolgozónkénti statisztika felület
- Dolgozónkénti (nem csak céges) nyitvatartás/szabadság admin felülete —
  az adatmodell (`business_hours.employee_id`, `closures.employee_id`)
  már támogatja
- Fizetéskezelés (a próbaidő lejárta most csak jelez, nem tilt le semmit —
  ez szándékos, amíg nincs kártyás fizetés bekötve)
