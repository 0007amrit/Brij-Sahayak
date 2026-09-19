# BrajSahayak — UI/UX Customization & Live Deployment Manual

This guide explains **how to modify the design, layout, colors, and content** of BrajSahayak, and **how to publish your changes to the live AWS website in 1 click**.

---

## 📁 1. Which File Should I Edit?

All user interface and styling code is located in [`frontend/src/`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/):

| Page / Component | File Path | What You Can Edit Here |
| :--- | :--- | :--- |
| **Homepage** | [`frontend/src/pages/HomePage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/HomePage.tsx) | Hero titles, tagline, call-to-action buttons, feature cards, emergency banners. |
| **Explore Destinations** | [`frontend/src/pages/TemplesPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/TemplesPage.tsx) | Search bar, city/category filter buttons, grid layout, temple cards listing. |
| **Temple Detail Page** | [`frontend/src/pages/TempleDetailPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/TempleDetailPage.tsx) | Temple header photo, timings, aarti schedules, dress codes, route guide, parking list. |
| **AI Braj Assistant** | [`frontend/src/pages/AssistantPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/AssistantPage.tsx) | Chat screen UI, quick question suggestion chips, avatar icons, disclaimer notes. |
| **Yatra Itinerary Planner** | [`frontend/src/pages/PlannerPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/PlannerPage.tsx) | Duration slider (hours), preferences checkboxes, timeline card design, print button. |
| **Stampede Saviour Monitor** | [`frontend/src/pages/SafetyPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/SafetyPage.tsx) | Live crowd density progress bars, alert badges (Low/Medium/High/Critical), safety tips. |
| **Authority Console** | [`frontend/src/pages/AuthorityDashboardPage.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/pages/AuthorityDashboardPage.tsx) | Authority login modal, simulation triggers, alert logs table, acknowledge buttons. |
| **Navigation Bar** | [`frontend/src/components/Navbar.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/components/Navbar.tsx) | Top logo, menu links, mobile dropdown menu. |
| **Footer** | [`frontend/src/components/Footer.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/components/Footer.tsx) | Bottom links, 24/7 helplines (100, 108, 1533), copyright text. |
| **Temple Card Component** | [`frontend/src/components/TempleCard.tsx`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/components/TempleCard.tsx) | Card shadow, image aspect ratio, location badges, tags. |
| **Global Styles & Fonts** | [`frontend/src/index.css`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/src/index.css) | Global Tailwind directives, scrollbar styling, fonts, root CSS variables. |
| **Photos & Images** | [`frontend/public/images/`](file:///Users/amritmishra05/Desktop/brajsahayak/frontend/public/images/) | High-res photos for all 32 temples (`M001.jpg`–`M032.jpeg`), frames, and icons. |

---

## 💻 2. Step 1: Preview Changes Locally in Real-Time

Before publishing to AWS, preview your edits on your computer with instantaneous hot-reloading:

1. Open your Mac Terminal.
2. Run:
   ```bash
   cd ~/Desktop/brajsahayak/frontend
   npm run dev
   ```
3. Open your browser at **`http://localhost:5173`**.
4. Every time you save a `.tsx` file in your code editor, the browser will update **in less than 50 milliseconds**!

---

## 🚀 3. Step 2: 1-Click Deploy to Live AWS Website

Whenever you are satisfied with your UI changes and want to update the live website:

Open your Mac Terminal and run this **single command**:

```bash
cd ~/Desktop/brajsahayak && ./deploy-frontend.sh
```

### What this script automatically does:
1. Compiles your TypeScript & React code with Vite into `frontend/dist/`.
2. Packages the production bundle into `dist.zip`.
3. Uploads and triggers deployment on **AWS Amplify**.
4. The live website at **[https://main.d28z732e1tc6qb.amplifyapp.com](https://main.d28z732e1tc6qb.amplifyapp.com)** updates automatically in ~30 seconds!

---

## 🎨 4. Common Design Tweaks Cheat-Sheet (Tailwind CSS)

### Changing Primary Colors
The current theme uses sacred warm colors (`amber-600`, `amber-700`, `stone-800`).  
To change a button or banner color, find its `className`:
- Saffron/Orange: `bg-amber-600 hover:bg-amber-700`
- Royal Blue: `bg-blue-600 hover:bg-blue-700`
- Deep Red / Crimson: `bg-red-700 hover:bg-red-800`
- Forest Green: `bg-emerald-600 hover:bg-emerald-700`

### Changing Corner Roundness
- Pill buttons: `rounded-full`
- Smooth modern cards: `rounded-2xl`
- Subtle rounded corners: `rounded-lg`
- Sharp corners: `rounded-none`

### Replacing a Temple Photo
1. Find the temple ID (e.g., `M010` is Banke Bihari, `M011` is Prem Mandir).
2. Save your new photo inside `frontend/public/images/` with the exact same name (e.g., `M010.webp` or `M011.jpeg`).
3. Run `./deploy-frontend.sh`. It will be updated both locally and in your AWS S3 bucket.
