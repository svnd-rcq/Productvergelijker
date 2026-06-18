# Productvergelijker POC – Reconneqt Hackathon

Een mobiele webapp waarmee gebruikers twee voedingsproducten kunnen vergelijken op basis van foto's, prijs en voedingswaarden. Gebouwd als POC voor de Reconneqt hackathon om te laten zien hoe AI de winkelervaring kan verbeteren.

---

## Wat doet de app?

1. Gebruiker voegt twee (of meer) productfoto's toe
2. AI analyseert de foto's en haalt productinformatie op
3. App toont een vergelijkingstabel met prijs, inhoud en voedingswaarden
4. App berekent deterministisch welk product het beste scoort per criterium
5. App toont een korte AI-samenvatting met aanbeveling

**Demo-modus** zorgt ervoor dat de hackathon-demo altijd werkt – zonder OpenAI API-key of echte foto's.

---

## Installatie

### Vereisten
- Node.js 18 of hoger
- npm 9 of hoger

### Stappen

```bash
# 1. Ga naar de projectmap
cd product-comparator-poc

# 2. Installeer alle dependencies (root + server + client)
npm run install:all

# 3. Start frontend én backend tegelijk
npm run dev
```

De app is daarna bereikbaar op:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

---

## Environment variables

Kopieer `.env.example` naar `.env` (al aangemaakt met standaardwaarden):

```bash
cp .env.example .env
```

| Variable | Standaard | Omschrijving |
|---|---|---|
| `DEMO_MODE` | `true` | `true` = vaste mockdata, `false` = OpenAI Vision |
| `OPENAI_API_KEY` | *(leeg)* | Alleen nodig als `DEMO_MODE=false` |
| `PORT` | `3001` | Poort voor de backend |

---

## Demo-modus

Met `DEMO_MODE=true` (standaard):
- Klik op **"🎭 Gebruik demo-producten"** of **"🎭 Demo starten"**
- De backend retourneert altijd vaste pindakaas-mockdata
- Geen OpenAI API-key nodig
- Werkt altijd, ook zonder internetverbinding

Demo-producten:
| Eigenschap | Calvé Pindakaas Stukjes | AH 100% Pindakaas |
|---|---|---|
| Prijs | € 2.49 | € 3.19 |
| Inhoud | 350 g | 500 g |
| Prijs per 100 g | € 0.71 | **€ 0.64** ✓ |
| Calorieën | 620 kcal | **590 kcal** ✓ |
| Suiker | 8 g | **5 g** ✓ |
| Zout | **0.4 g** ✓ | 0.7 g |
| Eiwitten | 25 g | **27 g** ✓ |

---

## OpenAI aanzetten

1. Stel een geldige API-key in `.env`:
   ```
   OPENAI_API_KEY=sk-...
   DEMO_MODE=false
   ```
2. Herstart de backend: `npm run dev`
3. Upload echte productfoto's en klik op **"🔍 Analyse starten"**

De backend gebruikt `gpt-4o` met vision. Als OpenAI faalt (fout, quota, etc.) valt de backend automatisch terug op mockdata zodat de demo blijft werken.

---

## Projectstructuur

```
product-comparator-poc/
├── package.json              # Root scripts (dev, install:all)
├── .env                      # Environment variables (lokaal)
├── .env.example              # Template
├── README.md
├── server/
│   ├── package.json
│   └── src/
│       ├── index.js          # Express server
│       ├── routes/
│       │   └── analyze.js    # POST /api/analyze
│       ├── services/
│       │   ├── mockAnalysisService.js    # Vaste mockdata
│       │   ├── openaiAnalysisService.js  # OpenAI Vision
│       │   └── comparisonService.js      # Deterministische vergelijking
│       └── data/
│           └── mockProducts.js           # Pindakaas-mockdata
└── client/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx           # Hoofdcomponent + state
        ├── components/
        │   ├── Header.jsx
        │   ├── StepIndicator.jsx
        │   ├── ProductCapture.jsx
        │   ├── ProductList.jsx
        │   ├── AnalyzeScreen.jsx
        │   ├── ComparisonTable.jsx
        │   ├── SummaryPanel.jsx
        │   └── Disclaimer.jsx
        ├── data/
        │   └── demoImages.js
        ├── utils/
        │   └── formatters.js
        └── styles/
            └── index.css
```

---

## API

### `POST /api/analyze`

**Request:**
```json
{
  "products": [
    { "id": "product_1", "images": ["data:image/jpeg;base64,..."] },
    { "id": "product_2", "images": ["data:image/jpeg;base64,..."] }
  ]
}
```

**Response:**
```json
{
  "category": "food",
  "products": [...],
  "comparison": {
    "best": {
      "price_per_100g": "product_2",
      "energy_kcal": "product_2",
      "sugar_g": "product_2",
      "salt_g": "product_1",
      "protein_g": "product_2"
    }
  },
  "summary": "AH 100% Pindakaas is goedkoper per 100 gram..."
}
```

### `GET /health`

Geeft server-status terug inclusief `demoMode` en `hasOpenAiKey`.

---

## Buiten scope voor deze POC

- POS-integratie (kassasysteem Reconneqt)
- Barcode-scanner / EAN-integratie
- Productmasterdata / productdatabase
- Loyaltydata en gepersonaliseerde aanbevelingen
- Gebruikersaccounts en authenticatie
- Juridische validatie van duurzaamheidsclaims
- Volledige ondersteuning voor alle productcategorieën (alleen voeding)
- Meerdere talen
- Offline-modus / PWA
- Beeldoptimalisatie en compressie voor langzame verbindingen

---

## Tech stack

| Laag | Technologie |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Backend | Node.js + Express |
| AI | OpenAI API (gpt-4o vision) |
| Runtime | Lokaal via npm |
