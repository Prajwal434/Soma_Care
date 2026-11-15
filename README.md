# SomaCare (साथी)

**A shared care routine for older adults and the people who support them.**

## The idea

**Chosen vertical: Elderly Care & Medication Management.** SomaCare is designed for an older adult following a daily medicine routine, with a trusted family member or caregiver helping with setup and coordination.

Medication reminders are usually built for one person managing one phone. Elder care is shared: an older adult follows the routine, while a family member or caregiver may organize prescriptions, appointments, and reminders—and worry when they cannot tell what happened.

SomaCare brings those jobs into one care flow. The senior gets a simple daily experience with optional voice and large actions. A caregiver can handle setup and coordination. SomaBox explores how a physical medicine tray could add context that a phone reminder cannot provide.

## What makes it more than a reminder app

The experience connects four steps:

1. **Set up together:** A caregiver can enter medicine schedules and appointments, choose reminder preferences, and prepare role-based family access.
2. **Make the daily routine accessible:** The senior can ask what medicine is next, confirm a dose with a large action, or use hands-free speech after enabling microphone access.
3. **Keep trusted people informed:** The caregiver view brings schedules, adherence activity, appointments, and family roles together.
4. **Add physical context:** The SomaBox concept maps a scheduled dose to a tray compartment and demonstrates how a sensor could flag a wrong slot or multiple pills.

The design recognizes two different needs: older adults should not have to navigate administrative setup every day, and caregivers need a useful way to coordinate care from a distance. The senior remains part of the decisions and can see and respond to their own routine.

## Assistant logic

The voice assistant uses local, explicit rules rather than a general-purpose medical model. It checks the saved schedule before responding: a dose already marked taken prompts a caution, refill questions read the saved quantity and ask before creating a local demo record, and next-dose or box questions map to the saved schedule. A spoken dose confirmation is recorded as self-reported. Medicine identification, dose validation, symptom assessment, physical double-dose prevention, and external escalation are outside the prototype.

## Why the UI has three sections

### 1. Senior Voice

The daily view is centered on medication prompts, the next scheduled dose, appointments, emergency contact access, and large one-tap actions. Voice is an option, not a requirement. After a person enables microphone access, they say **“Soma”** once and then speak normally until voice is turned off.

### 2. SomaBox Smart Tray

The tray view demonstrates four time-of-day compartments and sample safe, wrong-slot, and multiple-pill scenarios. It makes the physical part of the idea visible without adding hardware controls to the senior’s everyday screen.

### 3. Caregiver Portal

The caregiver view holds the less frequent setup and coordination work: schedules, adherence history, appointments, family access, and reminder choices. A family member, relative, or professional caregiver can help configure the service while keeping the older adult involved in access decisions.

## Why this business model fits

The ongoing job is family coordination, so a family subscription is the natural starting point to test. The person receiving care is the primary user; a family caregiver may be the payer because they take on setup and coordination and value visibility when they are away. This is a product hypothesis to validate with families, not proven demand.

The model can grow in stages:

- **Start with a family plan:** recurring access to shared schedules, adherence history, appointments, and reminders matches the continuing nature of the care work.
- **Offer SomaBox as an optional add-on:** families who want physical tray context can add hardware after the software routine is useful on its own.
- **Add pharmacy fulfillment only when it helps:** refill convenience may support referral or fulfillment revenue, with transparent pricing and explicit senior or caregiver approval. Commercial incentives should never determine clinical recommendations.
- **Explore provider or insurer programs later:** these require evidence of reliability, privacy, adoption, and outcomes before claims about savings or reduced hospital use are justified.

This sequence keeps the core product useful without requiring hardware or commerce. It also gives each potential revenue stream a clear role in the care experience.

## How the prototype maps to the challenge

| Challenge need | SomaCare demonstration |
| --- | --- |
| Manage daily medication schedules | Add and edit schedules in the caregiver view; senior self-reports a dose, which is logged locally |
| Coordinate family and caregiver access | Caregiver setup for Viewer or Caregiver roles with a demo passcode |
| Track doctor appointments | Appointment entry and shared appointment views |
| Plan email reminders | Select dose, missed-dose, and appointment reminder preferences |
| Improve accessibility for older adults | Optional voice, wake-word interaction, large visible actions, and a non-voice fallback |
| Go beyond app-only reminders | SomaBox tray map and simulated safety scenarios |

## What is implemented—and what is simulated

This is a front-end hackathon prototype using sample medication data. Caregivers can add and edit schedules in the current browser session; dose confirmations are self-reported. There is no production database or shared account system. Demo passcodes do not authenticate users, reminder settings do not send email, and pharmacy, WhatsApp, insurance, and appointment integrations are not connected to external services.

The SomaBox map uses the saved schedule to highlight a time-of-day compartment. A webcam can show a preview, but this prototype does not detect pills, hands, or ingestion from camera footage. The sample safety scenarios are simulations, not clinical validation.

Hands-free speech uses browser speech recognition. A person must explicitly enable it and grant microphone access; a webpage cannot silently switch on a microphone. Browser support varies, and the large buttons remain available if voice is unavailable or unwanted.

## Assumptions for the demonstration

- The older adult is the primary user. A family member or caregiver may help with setup, with the older adult retaining a say in who participates.
- Medication names, appointment details, family members, and refill records in the demo are sample data. Do not use them to guide real care.
- A dose marked taken reflects a person's confirmation; it does not prove ingestion.
- Passcodes, reminder preferences, refill choices, and appointments demonstrate intended workflows. They do not create accounts, send messages, place orders, charge payments, or persist to a shared service.
- The business model is a hypothesis: a family plan is a starting point to validate, while hardware, fulfillment, and insurer partnerships would need user research, agreements, and evidence.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In **Senior Voice**, choose **Enable hands-free voice**, allow microphone access, say **“Soma”** once, then ask **“Which medicine needs a refill?”** or **“Where is my next medicine in the box?”** Choose **Turn voice off** to stop listening.

## Run checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Demo navigation

Use the top navigation to switch between **Senior Voice**, **SomaBox Smart Tray**, and **Caregiver Portal**. The floating demo controls trigger sample check-ins, pill-scan prompts, safety scenarios, and refill flows.

## Technology

- Next.js 16 App Router, React, and TypeScript
- Tailwind CSS and Lucide icons
- Browser speech synthesis and speech recognition
- Simulated tray and service workflows
