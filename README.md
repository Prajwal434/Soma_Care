# SomaCare (साथी)

**Care routines for older adults, coordinated with the people who support them.**

SomaCare is a prototype for a common family-care gap: the older adult takes the medicine, but someone else often organizes the prescriptions, checks whether routines are on track, and worries from a distance. Most reminder apps are designed for one person managing one phone. Ongoing elder care is shared work.

Our product starts with medication routines and connects the senior’s daily experience to a caregiver’s setup and oversight tools. An optional smart tray explores how physical context could help answer a question a phone alone cannot: *which compartment did the person open, and did they take the expected number of pills?*

## Why SomaCare is different

We are not trying to win on having another alarm, checklist, or chat screen. The product is designed around a care loop:

1. A family member or caregiver helps set up medicines, appointments, access, and reminder preferences.
2. The senior sees a simple routine, can use large touch actions, and can choose voice interaction.
3. Dose confirmations and questions update a shared view for the people the senior trusts.
4. The SomaBox concept adds a physical signal from the medicine tray, with the goal of catching wrong-slot or multiple-pill events that a self-reported reminder cannot see.

The distinction is coordination plus context. The senior remains the person receiving care and should remain part of decisions. The caregiver gets the tools to do the administrative work without pushing that complexity onto the senior’s daily screen.

## Why the interface has three sections

The person receiving care is not always the person who first configures the service. An adult child, relative, or professional caregiver may enter the medication list, add appointments, choose reminder recipients, and invite other family members. We separate those tasks from the everyday senior experience while keeping the senior visible and involved.

### 1. Senior Voice

A daily view for medication prompts, the next scheduled dose, large one-tap actions, appointments, and emergency contact access. Hands-free voice is optional. After a user enables microphone access, they can say **“Soma”** once and then speak normally until they turn voice off. Large buttons remain available if voice recognition is unavailable or unwanted.

### 2. SomaBox Smart Tray

A device-oriented view for the four time-of-day compartments and safety scenarios. It demonstrates how scheduled medicines could map to tray slots and how a connected sensor might report an event. The current box map is a schedule visualization; it does not perform real pill or hand detection.

### 3. Caregiver Portal

A management view for medication schedules, adherence history, appointments, family roles, and reminder preferences. The Care Setup panel is where a caregiver can prepare an invite, choose the alerts they want configured, and add an appointment. The senior should be included in decisions about who is invited and which information is shared.

## Business model: recurring care first, optional services later

Our starting business hypothesis is a family-paid subscription for ongoing coordination. The family caregiver is often the person who feels the daily operational burden and is willing to pay for visibility and support; the older adult is the primary user whose routine the product must make easier. We need to validate that willingness to pay with families before treating it as proven.

| Layer | Customer value | Business rationale | When to introduce |
| --- | --- | --- | --- |
| Family care subscription | Shared schedules, adherence history, reminders, and trusted access | Recurring revenue matches a continuing care need and funds the coordination experience | Initial product wedge |
| Optional SomaBox hardware | Physical compartment context and potential safety checks | Adds value for families who need more than self-reported dose tracking without making hardware a requirement | After the software routine is useful on its own |
| Pharmacy fulfillment | A simpler way to replenish prescribed medicines | Can earn referral or fulfillment revenue when it saves families effort | Only with clear pricing, consent, and caregiver/senior approval; never let commissions determine clinical recommendations |
| Provider or insurer programs | Better-supported care coordination and, eventually, evidence about routine adherence | Could support distribution or contracts if partners value validated outcomes | Later, after privacy, reliability, and outcome evidence exist |

This model is intentionally sequenced. Subscription revenue is the core because the recurring job is helping a family coordinate care over time. Hardware and fulfillment can improve the experience, but they should not be prerequisites or incentives to consume more medicine. Institutional contracts are an expansion path, not an early claim about proven savings.

## What we need to prove next

The prototype expresses a product thesis; it does not yet prove clinical impact or commercial demand. The next validation work should answer:

- Can an older adult understand and complete the daily medication flow without caregiver coaching?
- Can a caregiver set up the profile, reminders, and access in a few minutes?
- Do shared confirmations reduce uncertainty and coordination effort for families?
- Does the tray concept reliably distinguish the correct slot and pill-count events in real conditions?
- Will families pay for the core coordination product before hardware or pharmacy features are added?

We should measure task completion, missed or ambiguous confirmations, caregiver setup time, continued use, and willingness to pay. Any safety or health outcome claims require appropriate validation; the demo numbers and scenarios are not evidence of clinical benefit.

## Current prototype boundaries

This repository is a front-end hackathon prototype. Family passcodes do not authenticate accounts, reminder settings do not send email, and there is no shared production database. Appointment, pharmacy, WhatsApp, insurance, and tray actions may be simulated. The demo tray map uses the saved schedule to highlight a compartment; a camera preview does not detect pills or hand movements.

The hands-free voice feature uses browser speech recognition. A person must explicitly enable it and grant microphone access; a webpage cannot turn on the microphone silently. Browser support varies. Voice is optional and the visible actions are the fallback.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In **Senior Voice**, choose **Enable hands-free voice**, allow microphone access, say **“Soma”** once, then ask a question such as **“Which medicine needs a refill?”** or **“Where is my next medicine in the box?”** Use **Turn voice off** to stop listening.

## Run checks

```bash
npm test
npx tsc --noEmit
npm run build
```

## Demo navigation

The top navigation switches between **Senior Voice**, **SomaBox Smart Tray**, and **Caregiver Portal**. Floating demo controls trigger sample check-ins, pill-scan prompts, safety scenarios, and refill flows. Treat those as simulations, not live clinical or fulfillment services.

## Technology

- Next.js 14 App Router, React, and TypeScript
- Tailwind CSS and Lucide icons
- Browser speech synthesis and speech recognition
- Simulated tray and service workflows
