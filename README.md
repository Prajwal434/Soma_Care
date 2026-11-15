# SomaCare (साथी)

SomaCare is a hackathon prototype for collaborative elderly care. It brings medication routines, family coordination, and an optional smart medicine tray into one shared care experience. The interface is split into three sections because each participant has different needs and comfort levels with technology.

## Why the UI has three sections

The person receiving care remains at the centre of decisions, but they are not always the person who will set up and maintain a digital service. An adult child, relative, or hired caregiver may be the person who first configures the profile, enters prescriptions, adds appointments, and chooses who receives reminders. The UI gives that person a practical setup space without making the older adult navigate configuration screens every day.

### 1. Senior Voice

This is the senior’s simple daily view: voice-assisted medication reminders, a large microphone control, visible one-tap actions, today’s medication schedule, an appointment summary, and emergency contact access. The senior can confirm a dose or ask for help directly. Family members can assist with setup, but the person receiving care can still see and respond to their own routine.

The hands-free voice option uses the browser’s speech recognition. The senior or a helper must tap **Enable hands-free voice** and allow microphone access in the browser. After permission is granted, say **“Soma”** followed by a request. A visible control turns listening off. Browser support varies, so the large on-screen actions remain available as a fallback. A webpage cannot silently enable a device microphone or listen before the user grants permission.

### 2. SomaBox Smart Tray

This section demonstrates the optional physical medicine-tray companion: slot activity, camera concepts, and safety scenarios such as a wrong compartment or multiple pills. It is a distinct device-oriented view so seniors do not need to use the camera and hardware controls as part of their normal daily app flow.

### 3. Caregiver Portal

This is the detailed management view for an adult child, family member, or professional caregiver. It includes adherence history, medication and refill information, appointment planning, family access roles, and reminder preferences. The **Care Setup** panel lets the helper prepare a family invite, choose which email reminders to configure, and add an appointment. This separates occasional administrative work from the senior’s daily experience.

The setup and service integrations in this prototype are demonstrations. Passcodes do not authenticate accounts, and reminder preferences do not send email. Appointment, pharmacy, WhatsApp, camera, and insurance actions may show simulated states rather than contacting real services. The senior remains the care recipient and should be included in decisions about their care and who can access their information.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To try voice, open the **Senior Voice** section, choose **Enable hands-free voice**, and allow microphone access when the browser asks. Try **“Soma, what medicine should I take?”** Use **Turn voice off** to stop microphone listening.

Speech recognition works only in browsers that implement the Web Speech API and may require a secure context. `localhost` is treated as a secure context by modern browsers. If voice recognition is unavailable or denied, use the large visible actions.

## Run checks

```bash
npm test
npx tsc --noEmit
npm run build
```

## Stack

- Next.js 14 App Router and React
- TypeScript and Tailwind CSS
- Lucide icons
- Browser speech synthesis and speech recognition APIs
- Simulated SomaBox camera and pharmacy workflows

## Demo navigation

The top navigation switches between **Senior Voice**, **SomaBox Smart Tray**, and **Caregiver Portal**. Demo scenarios are available in the floating demo controls. Use them to demonstrate voice check-in, pill vision, wrong-slot and double-dose safety responses, and refill flows. These scenarios are simulations, not live clinical or fulfillment services.
