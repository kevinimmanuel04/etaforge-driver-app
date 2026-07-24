# 🚑 ETAForge Emergency Ambulance Driver & Dispatch Portal

An intelligent, real-time emergency dispatch and driver navigation interface built for emergency response units. This application operates as an integral component of the **ETAForge Smart Transit & Emergency Response Ecosystem**, seamlessly connecting ambulance drivers directly to citizen SOS emergency requests in real time.

---

## 🔒 Security & Environment Protection

All sensitive credentials (API keys, Firebase configs) are managed via environment variables and strictly excluded from Git tracking via `.gitignore`. 

> [!IMPORTANT]
> **Never commit your `.env` file to version control.** A template `.env.example` file is provided for environment configuration.

---

## 🌟 Key Features

- **🚨 Real-Time SOS Dispatch Modal**: Instant visual and alert notifications when a citizen triggers a medical emergency.
- **🗺️ Interactive Google Maps Navigation**: Live route rendering between driver location, emergency patient position, and target hospital destination.
- **🟢 Simulated Green Corridor Traffic Signals**: Priority traffic signal management visualization along the emergency route.
- **🩺 Live Patient Vitals & Medical Card**: Real-time display of patient heart rate (BPM), blood group, emergency contact details, and medical notes.
- **🌓 Adaptive Night / Day Mode**: High-contrast UI optimized for night driving and bright daylight conditions.
- **⚡ Zero-Friction Anonymous Authentication**: Auto-authenticates drivers using Firebase Anonymous Auth for instant deployment without login delays.

---

## 🔗 Integration Architecture: How Both Apps Work Together

This repository (**`etaforge driver app`**) operates in direct synchronization with the main citizen web platform (**`etaforge final ready`**). 

```
┌──────────────────────────────────────┐                ┌──────────────────────────────────────┐
│        ETAForge Main App             │                │        ETAForge Driver App           │
│     (etaforge final ready)           │                │     (etaforge driver app)            │
│  [Citizen SOS / Medical Emergency]   │                │  [Ambulance Dispatch & Navigation]   │
└──────────────────┬───────────────────┘                └──────────────────▲───────────────────┘
                   │                                                       │
                   │ Creates/Updates Emergency Document                    │ Real-time Firestore Listener
                   ▼                                                       │
 ┌─────────────────────────────────────────────────────────────────────────┴──────────────────┐
 │                                   Firebase Firestore                                       │
 │              Collection: artifacts/etaforge-live-main/public/data/emergency_alerts         │
 └────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 🔄 End-to-End Emergency Workflow

1. **SOS Trigger (Main App)**:
   - A citizen or bystander clicks **Medical Emergency SOS** in `etaforge final ready`.
   - The main app queries user location and nearest hospital, then writes a document to Firestore:
     ```json
     {
       "type": "MEDICAL_EMERGENCY",
       "status": "ACTIVE",
       "location": { "lat": 12.9716, "lng": 77.5946 },
       "address": "MG Road, Bengaluru",
       "nearestHospital": "Manipal Hospital",
       "user": { "name": "Patient", "bpm": "142", "bloodType": "O+" },
       "timestamp": "serverTimestamp()"
     }
     ```

2. **Real-Time Dispatch Notification (Driver App)**:
   - `etaforge driver app` listens to the Firestore collection in real-time (`onSnapshot`).
   - When an `ACTIVE` or `PENDING` alert appears, the Driver App instantly switches from `STANDBY` to `ALERT` mode with a full-screen emergency dispatch modal.

3. **Mission Acceptance**:
   - The driver clicks **Accept Mission** in the Driver App.
   - The document status in Firestore is updated to `"ACCEPTED"` with the driver's unique ID (`driverId`).
   - The citizen UI in `etaforge final ready` immediately reflects that an ambulance has been dispatched, updating the status and estimated arrival time.

4. **Live Navigation & Green Corridor**:
   - The Driver App calculates the optimal route to the patient and onwards to the hospital using Google Maps API.
   - Green corridor signals along the route turn green to prioritize emergency vehicle movement.

5. **Mission Completion**:
   - Upon arriving at the hospital, the driver clicks **Complete Mission**.
   - Firestore document status updates to `"COMPLETED"`, resolving the emergency across both applications simultaneously.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Geospatial & Mapping**: Google Maps JavaScript API (`places`, `geometry`)
- **Backend & Database**: Firebase Firestore & Firebase Authentication

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Installation

Clone or open the repository folder, then install dependencies:

```bash
# Navigate to the driver app directory
cd ambulance-app

# Install npm dependencies
npm install
```

### 3. Environment Variable Setup

Copy the `.env.example` file to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase and Google Maps API keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Running Locally

Start the local Vite development server:

```bash
# From root directory:
npm run dev

# Or directly inside ambulance-app:
cd ambulance-app
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### 5. Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the built application locally:

```bash
npm run preview
```

---

## 📤 Publishing to GitHub

This repository is fully configured for 1-click upload to GitHub.

### Option A: Via VS Code (1-Click Publish)
1. Open this repository folder (`etaforge driver app`) in VS Code.
2. Go to the **Source Control** tab on the left sidebar (`Ctrl+Shift+G`).
3. Click **Publish to GitHub** or **Publish Branch**.
4. Choose whether to make the repository **Public** or **Private**.
5. VS Code will automatically push all files securely to your GitHub account!

### Option B: Via Terminal / Git CLI
If you prefer using the terminal:

```bash
# 1. Add all untracked files and make an initial commit
git add .
git commit -m "feat: initial commit for ETAForge Ambulance Driver App"

# 2. Rename branch to main
git branch -M main

# 3. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/etaforge-driver-app.git

# 4. Push to GitHub
git push -u origin main
```

---

## 📄 License

This project is part of the **ETAForge Smart Transit System**.
