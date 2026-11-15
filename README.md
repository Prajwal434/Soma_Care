# SomaCare (साथी AI)
### Voice-First Elderly Care Companion & Smart Pharmacy Network
*Built for Catalyst Hackathon 2026 by MnM, PromptWars, Hack2skill*

---

## 💡 The Core Problem
Over **140 million seniors in India** suffer from chronic conditions (diabetes, hypertension, arthritis). **Over 60% fail their medication schedules** because modern apps and push notifications have too much cognitive friction:
1. Seniors cannot navigate complex dropdowns or tiny fonts on smartphones.
2. Clicking a button or saying *"I took it"* does **not** prevent accidental double-dosing if their hands shake and lift two pills from the box.
3. Seniors often confuse compartments (e.g. taking nighttime sleeping/cholesterol pills in the morning).
4. Working children (in Bangalore, Mumbai, or abroad as NRIs) experience daily anxiety and guilt over their parents' health.

---

## 🚀 The Solution: SomaCare & SomaBox™
**The elder is the user, but the working child is the buyer.**

SomaCare replaces app friction with an empathetic, zero-touch voice companion for the senior, paired with an automated pharmacy fulfillment and InsurTech engine for the family.

### Key Capabilities:
1. **📦 SomaBox™ Ambient Tray Sentinel (The ₹499 Smart Box):**
   - Turns any cheap plastic 7-day pill organizer into a computer-vision dispenser using a $4 ESP32-CAM or phone stand.
   - **Continuous Camera Feed & Action Tracking:** Watches compartments and hand movements in real-time.
   - **Overdose Intercept:** Counts tablets in the senior's hand. If $\ge 2$ pills are lifted, device shouts: *"Babuji STOP! That's wrong! You took out TWO tablets from the morning box. Put one back!"*
   - **Wrong Compartment Guard:** Warns if the senior opens the Night slot during morning hours.
   - **Emergency Caretaker Dispatch:** Automatically fires a high-priority WhatsApp alert to the primary caretaker with a snapshot.
2. **Zero-Touch Conversational Voice (Hinglish/Indian English):**
   - Natural spoken check-ins ("Namaste Babuji, did you take your morning sugar tablet?").
   - Two-way voice dialogue using Web Speech API (zero latency, native browser support).
3. **Multimodal Pill & Prescription Vision OCR:**
   - Hold up a blister pack or medicine strip to the camera lens.
   - AI extracts drug name, dosage, checks against active doctor prescriptions, and confirms safety.
4. **Voice Auto-Refill (The Commerce Engine):**
   - When a medicine reaches $\le 3$ pills, AI verbally prompts: *"Babuji, only 2 tablets left of Glycomet. Shall I order a 30-day refill from Tata 1mg for ₹245?"*
   - Senior verbally confirms $\rightarrow$ Order dispatched directly to caregiver's card.
5. **Caregiver Peace-of-Mind Portal & InsurTech Scorecard:**
   - Live Heartbeat with verified logs and acoustic sentiment analysis ("Cheerful", "Confused", "Lethargic").
   - InsurTech compliance certificate export granting 12% health insurance premium rebates for verified $\ge 90\%$ adherence.

---

## 💰 The Defensible Business Model
| Revenue Stream | Target Persona | Pricing / Take-Rate |
| :--- | :--- | :--- |
| **B2C Distance Caregiver SaaS** | 30M+ working tech professionals / NRIs living away from parents | ₹1,499 / month ($19/mo) |
| **Hardware Bundle (SomaBox)** | ₹499 plastic box + micro-cam bundled with 6-month subscription | High conversion & physical stickiness |
| **Pharmacy Refill Commerce** | Repeat monthly chronic prescriptions fulfilled via Tata 1mg & Apollo | 12%–18% affiliate commission on recurring GMV |
| **B2B InsurTech / Hospital Readmissions** | Health insurers (Star Health, Care, HDFC Ergo) | ₹4,200 annual rebate per policyholder for cutting ICU admissions |

---

## ⚡ 2-Minute Demo Script for Hackathon Judges

1. **Open the App:** Navigate to `http://localhost:3000`.
2. **Step 1 - Voice Check-in:** Click `1. Voice Check-in` in the floating demo runner. Show the natural spoken dialogue.
3. **Step 2 - The Killer Feature: SomaBox™ Smart Tray:** Switch to **`2. SomaBox™ Smart Tray`** in the top navigation.
   - Show the 4-slot medicine organizer with live micro-cam tracking.
   - Click **`Scenario 2 (Hazard): Babuji pulls out 2 Pills!`**
   - Watch the computer vision detect 2 pills, trigger the loud voice alert (*"Babuji STOP! That's wrong!"*), and immediately dispatch the emergency WhatsApp alert to Rahul (+91 98450 12345).
   - Click **`Scenario 3 (Wrong Slot)`** to show what happens if he opens the Night compartment in the morning.
4. **Step 3 - Pill Vision OCR:** Click `2. Pill Vision OCR` to show the blister pack camera scanner.
5. **Step 4 - Voice Auto-Refill (Commerce):** Click `5. Voice Refill (1mg)` to show the 1-click reorder via Tata 1mg.
6. **Step 5 - Caregiver Portal:** Switch to **`3. Caregiver Portal`** to show real-time adherence logs, pharmacy delivery tracking, and the **InsurTech Compliance Certificate**.
7. **Step 6 - Pitch Deck:** Click **"Pitch & Business"** to show unit economics and margins.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Accessible high-contrast elderly design)
- **Icons:** Lucide React
- **Voice Intelligence:** Web Speech SpeechSynthesis & SpeechRecognition
- **Computer Vision:** Edge Micro-Vision Neural Net simulation + MediaDevices Webcam API
- **Dev Server:** `http://localhost:3000`
