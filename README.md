# 🎾 Slovenian Padel League

Spletna aplikacija za organizacijo padel tekmovanj v Sloveniji.

**🌐 Live:** https://padel-liga-bay.vercel.app

---

## 📋 O projektu

### Problem
Padel je eden najhitreje rastočih športov v Sloveniji, vendar ni platforme ki bi združevala skupnost – iskanje nasprotnikov, organizacija tekem in sledenje statistikam je razdrobljeno med WhatsApp skupinami in ustnimi dogovori.

### Rešitev
Slovenian Padel League je celovita platforma ki omogoča:
- Iskanje nasprotnikov v svoji ligi
- Organizacijo tekem s potrditvijo rezultatov
- Sledenje statistikam in napredovanju skozi 5 lig
- Organizacijo turnirjev z bracket sistemom
- Komunikacijo med igralci

### Ciljna skupina
Padel igralci v Sloveniji vseh starosti, ki iščejo organizirano tekmovalno okolje.

---

## ✨ Funkcionalnosti

| Funkcionalnost | Opis |
|---|---|
| 🔐 Auth sistem | Registracija, prijava, reset gesla, sprememba gesla |
| 👤 Profil | Avatar, značke za dosežke, statistike |
| 🔍 Matchmaking | Iskanje nasprotnikov z 2h timeout sistemom |
| 📬 Povabila | Sistem povabil z email obvestili |
| ✅ Rezultati | Potrditev rezultatov s strani obeh igralcev |
| 🏆 Lestvica | Ranglista po 5 ligah (Starter → Elite) |
| 🎾 Turnirji | Izločilni sistem z bracket prikazom |
| 💬 Chat | Real-time DM chat med igralci |
| 📝 Zgodovina | Pregled vseh odigranih tekem |
| 📍 Igrišča | Padel centri po Sloveniji z rezervacijami |
| ⚙️ Admin panel | Upravljanje igralcev, lig in statistik |
| 🔒 Middleware | Zaščita vseh strani pred neprijavljenimi |

---

## 🛠️ Tehnologije

### Frontend
- **Next.js 16** – React framework z App Router
- **TypeScript** – Tipiziran JavaScript
- **Tailwind CSS** – Utility-first CSS framework

### Backend
- **Next.js API Routes** – Server-side API endpoints
- **Supabase** – PostgreSQL baza + Auth + Storage
- **Row Level Security (RLS)** – Varnost na ravni baze

### Storitve
- **Brevo** – Email obvestila (povabila, rezultati, turnirji)
- **Vercel** – Hosting in deployment
- **Supabase Storage** – Shranjevanje profilnih slik

---

## 🗄️ Struktura baze
```
profiles          → Profili igralcev
ekipe             → Ekipe (2 igralca)
tekme             → Tekme (ročni vnos)
povabila          → Povabila med igralci
turnirji          → Turnirji
turnir_prijave    → Prijave na turnirje
turnir_tekme      → Tekme znotraj turnirjev
sporocila         → DM sporočila
znacke            → Značke za dosežke
```

---

## 📁 Struktura projekta
```
src/
├── app/
│   ├── api/              → API routes (email, značke...)
│   ├── admin/            → Admin panel
│   ├── auth/             → Login, register, reset gesla
│   ├── chat/             → Real-time DM chat
│   ├── dashboard/        → Glavna stran
│   ├── igrisca/          → Padel centri v Sloveniji
│   ├── iskanje-tekme/    → Matchmaking
│   ├── lestvica/         → Ranglista
│   ├── onboarding/       → Nastavitev profila
│   ├── povabila/         → Sistem povabil
│   ├── profil/           → Profil strani
│   ├── tekma/            → Ročni vnos rezultatov
│   ├── turnirji/         → Turnirji
│   └── zgodovina/        → Zgodovina tekem
├── components/
│   └── Avatar.tsx        → Komponenta za profilno sliko
├── lib/
│   └── supabase.ts       → Supabase client
└── middleware.ts         → Zaščita strani
```

---

## 🚀 Lokalni razvoj

### Predpogoji
- Node.js 18+
- npm ali yarn
- Supabase račun
- Brevo račun

### Namestitev
```bash
# Kloniraj repozitorij
git clone https://github.com/lukajela/padel-liga.git
cd padel-liga

# Namesti odvisnosti
npm install

# Ustvari .env.local
cp .env.example .env.local
```

### Environment spremenljivke
```env
NEXT_PUBLIC_SUPABASE_URL=tvoj_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj_anon_key
SUPABASE_SERVICE_ROLE_KEY=tvoj_service_role_key
BREVO_API_KEY=tvoj_brevo_api_key
```

### Zagon
```bash
npm run dev
# Odpri http://localhost:3000
```

---

## 🏗️ Arhitektura
```
Browser → Next.js (Vercel)
              ↓
         API Routes
              ↓
    Supabase PostgreSQL
    Supabase Storage
    Brevo Email API
```

### Varnost
- **Middleware** zaščiti vse strani pred neprijavljenimi uporabniki
- **RLS politike** na Supabase preprečujejo nepooblaščen dostop do podatkov
- **Service Role Key** se uporablja samo server-side
- **Admin zaščita** – samo admin lahko dostopa do `/admin`

---

## 📊 Lige in napredovanje

| Liga | Potrebno zmag | Emoji |
|---|---|---|
| Starter | 5 | 🌱 |
| Challenger | 8 | ⚡ |
| Competitor | 10 | 🔥 |
| Pro | 12 | 💎 |
| Elite | Vrh | 👑 |

---

## 🏅 Značke

| Značka | Pogoj |
|---|---|
| 🎾 Prva tekma | Odigraj svojo prvo tekmo |
| 🏆 Prva zmaga | Zmagaj svojo prvo tekmo |
| 🔥 5 zmag zapored | Zmagaj 5 tekem zapored |
| ⚡ Napredovanje | Napreduj v višjo ligo |
| 👑 Elite liga | Doseži Elite ligo |
| 🏅 Turnirski zmagovalec | Zmagaj turnir |

---

## 👨‍💻 Avtor

**Luka Jelić**
- GitHub: [@lukajela](https://github.com/lukajela)
- Email: jelicluka13@gmail.com

---

## 📄 Pravni dokumenti

- [Pogoji uporabe](https://padel-liga-bay.vercel.app/pogoji)
- [Politika zasebnosti](https://padel-liga-bay.vercel.app/zasebnost)

---

*Slovenian Padel League · Tekmovanje · Strast · Skupnost* 🎾