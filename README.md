# BMSCE Placement Tracker 2026

A fast, lightweight, and modern placement tracker web application for **BMS College of Engineering (Batch 2026)**.

Directly connected to a single Google Sheet (or local Excel spreadsheet) with live auto-refresh.

---

## ⚡ How It Works

1. **Single Sheet Management**:
   Manage your placement drives from your phone or desktop via Google Sheets (or edit `data/placements.xlsx` / `data/placements.csv`).

2. **Required Columns (Row 1)**:
   ```text
   Company | Role | Tier | Date Listed | CTC | Stipend | Eligible Branches | Deadline | Superset Link
   ```

3. **Live Sync to UI**:
   The web application automatically polls for updates every 8 seconds (and immediately when tab is focused). Any change made on your phone reflects live on the portal!

---

## 🚀 Running the App

```bash
# Start dev server
npm run dev

# Or build for production
npm run build
npm run start
```

Visit: `http://localhost:3000`

---

## ⚙️ Configuration (`.env`)

Add your Google Sheets URL to `.env`:
```env
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing
```
*(Make sure sharing is set to **"Anyone with the link can view"**)*
