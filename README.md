# Exoplanetarium: An AI Platform for Exoplanet Discovery & Education

#### 🪐 Event - NASA Space Apps Challenge 2025 [Noida]
#### 👨‍🚀 Team Name - CODE4CHANGE
#### 💡 Problem Statement - *A World Away: Hunting for Exoplanets with AI*
#### 📩 Team Leader Email - debshatachoudhury@gmail.com

---

## 🌠 A Brief of the Prototype
![Landing Page](designs/LandingPage.png)  
**Exoplanetarium** is a next-generation **AI-powered web platform** designed to explore, classify, and visualize exoplanets discovered through NASA's missions.  

It brings together *machine learning, astrophysics, and interactive visualization* to make the study of exoplanets engaging for **students, researchers, and astronomy enthusiasts** alike.  

The platform automates the classification of exoplanetary candidates, simulates atmospheric and orbital properties, and visualizes telescope missions—all within a single unified interface.  

By leveraging *NASA's open-source datasets* and *AI models*, the project enables automatic exoplanet identification while offering educational, visual, and research-focused tools for users.  

---

## 🌍 Modules Overview

### 🧠 1. Exoplanet Classification Tool (Flask App)
![Classifier Inputs](designs/LabClassifierInputs.png)  
![Classifier Results](designs/LabClassifier.png)  
A **web-based ML classifier** that predicts whether an object is a **Confirmed Planet, Candidate, or False Positive**.  
- Accepts astrophysical parameters like *orbital period*, *transit depth*, *planet radius*, and *stellar radius*.  
- Utilizes **LightGBM** and **XGBoost** ensemble models for robust predictions.  
- Displays classification confidence scores through an intuitive interface.  

> 💡 In short, it's an intelligent prediction system powered by ensemble learning for exoplanet classification.

---

### ☁️ 2. Exoplanet Atmosphere Visualization API
![Atmospheric Analysis](designs/LabAtmosphere.png)  
A **Flask-based API** for retrieving and visualizing exoplanet atmosphere data.  
- Loads and normalizes CSV datasets from NASA archives.  
- Generates **synthetic transit and spectral curves** when data is incomplete.  
- Detects and lists key molecules (H₂O, CO₂, CH₄, etc.) in planetary atmospheres.  

**Main Endpoints**
```
/api/types      → Returns available planet types
/api/planets    → Lists planets by type
/api/data       → Returns detailed atmospheric & spectral data
```

> 🌌 This backend service powers the interactive visualizations in the frontend dashboard.

---

### 🔭 3. Exoplanet Discovery Methods (Educational Web App)
![Exoplanet Discovery Methods](designs/PlayDiscovery.png)  
An **interactive educational module** built with **Next.js + Tailwind CSS**, showcasing five exoplanet detection techniques:  
- Transit Timing Variation (TTV)  
- Radial Velocity  
- Microlensing  
- Direct Imaging  
- Astrometry  

**Key Features**
- Animated, gradient-themed cards for each discovery method  
- Responsive grid layout with light/dark mode  
- Framer Motion animations and hover interactions  

> 🎓 Designed for education, it simplifies complex astronomical techniques through visuals and interactivity.

---

### 🎨 4. Interactive 3D Planet Creator
![Interactive 3D Planet Creator](designs/PlayDraw.png)  
A **creative AI-powered experience** allowing users to **draw and generate planets**.  
- Users sketch planetary textures on a circular canvas.  
- Real-time 3D sphere preview powered by **Three.js**.  
- **Google Gemini AI** analyzes colors to classify the planet (Terrestrial, Super-Earth, Gas Giant, etc.).  
- Educational explanations of each type are provided in real-time.  

**Tech Highlights**
- React Sketch Canvas + Three.js  
- AI Classification via Gemini  
- Responsive design across devices  

> 🧑‍🎨 Makes astronomy accessible and fun for all ages by merging creativity with science.

---

### 🛰️ 5. Exoplanet Telescope Timeline
![Exoplanet Telescope Timeline](designs/PlayTimeline.png)  

An **interactive 3D timeline** showcasing major telescope missions from *Hubble (1990)* to *Ariel (2029)*.  
- Chronological animation with glowing markers  
- Clickable 3D telescope models (.glb)  
- Pop-up mission data and launch history  
- Particle-based space background for immersion  

> 🕰️ Offers users an engaging way to explore the evolution of exoplanet discovery missions.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js · TypeScript · Tailwind CSS · ShadCN UI · Three.js · Plotly.js · Framer Motion |
| **Backend** | Flask · Flask-CORS |
| **Authentication** | Clerk Auth |
| **AI & ML** | CNN · XGBoost · LightGBM · PCA / t-SNE · K-Means · DBSCAN · Isolation Forest · Autoencoders |
| **APIs & Add-Ons** | NASA Exoplanet Archive API · WebGL (3D Rendering) |
| **Deployment** | Vercel (Frontend) · Render (Backend) |

---

## 👨‍👩‍👧‍👦 Meet the Team – CODE4CHANGE

| Member | Role |
|--------|------|
| **Debshata Choudhury** | Team Lead / Data Analyst |
| **Niranjan Praveen** | Frontend Engineer / Version Control Specialist |
| **Vaibhav Jain** | Frontend Engineer / API Engineer |
| **Abhishek Chaubey** | 3D Visualization Specialist |
| **Pratham Ranjan** | AI/ML Engineer |
| **Shreyansh Jaiswal** | AI/ML Engineer / Solutions Architect |

> ✨ Together, Team CODE4CHANGE envisions making **space science more interactive, data-driven, and accessible** through cutting-edge web technologies and AI.

---

## 🧩 Code Execution Instructions

The project runs as **three independent processes** in **three separate terminals**. There is no
orchestrator and no single command that starts everything.

#### 0️⃣ Clone and install

```bash
git clone https://github.com/Niranjan1Praveen/Exoplanetarium-NasaSpaceAppsChallenge.git
cd Exoplanetarium-NasaSpaceAppsChallenge
```

**System dependency — macOS only.** LightGBM/XGBoost macOS wheels do not bundle an OpenMP runtime:

```bash
brew install libomp
```

> ❗ macOS only. **Linux** users need nothing extra (the `manylinux` wheels link `libgomp`, already
> present). **Windows** users need nothing extra. Do **not** run Homebrew commands on Linux/Windows,
> and never add `libomp` to `requirements.txt`.

Python dependencies (recommended: **Python 3.12**):

```bash
python3.12 -m venv server/venv
source server/venv/bin/activate          # Windows: .\server\venv\Scripts\Activate.ps1
pip install -r server/atmosphere/requirements.txt -r server/classifier/requirements.txt
```

Frontend dependencies and environment variables:

```bash
cd client
npm install
cp .env.example .env.local               # then fill in your own keys
```

`client/.env.local` must contain at least:

```bash
NEXT_PUBLIC_ATMOSPHERE_URL=http://localhost:5000
NEXT_PUBLIC_CLASSIFIER_URL=http://127.0.0.1:5003
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_GEMINI_API_KEY=xxx
```

#### 1️⃣ Terminal 1 — Atmosphere API → http://localhost:5000

```bash
cd server/atmosphere
python app.py
```

#### 2️⃣ Terminal 2 — Classifier → http://127.0.0.1:5003

```bash
cd server/classifier
python app.py
```

#### 3️⃣ Terminal 3 — Frontend → http://localhost:3000

```bash
cd client
npm run dev
```

Then visit **http://localhost:3000**.

> Both backends must be started from **inside their own directory** — the Atmosphere service locates
> its CSV by globbing its own folder.

For production (Render/Vercel) start commands, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 🚀 Future Plans

- Integration of **real-time NASA mission feeds**
- Enhanced **mobile accessibility and VR mode**
- Addition of **hyperparameter tuning** through the interface
- Community module for **uploading and benchmarking custom models**
- Continuous learning pipeline for improving classification accuracy

---

## 🌌 Why It Matters

Exoplanetarium bridges the gap between **astronomy research** and **AI-driven interactivity**.

By merging machine learning with cosmic data, it transforms how researchers and students explore planets beyond our solar system — **making space science more immersive, automated, and understandable**.  

> "Exploring worlds beyond our own begins with understanding the data that reveals them."

---
