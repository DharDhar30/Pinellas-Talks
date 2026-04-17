# Pinellas County Voter Concerns Survey

A full-stack React application cretaed to collect community feedback on local political and infrastructure issues in Florida, Pinellas County. The website features a public survey and a secure, authenticated admin dashboard for viewing survey data.

## Features

- **Interactive Survey Interface:** Users can rate their agreement on various local issues using custom 1-10 sliders.
- **Client-Side Routing:** Built with `react-router-dom` to handle view switching without page reloads.
- **Secure Admin Dashboard:** A protected `/admin` route that uses Firebase Authentication to act as a "Bouncer," redirecting unauthenticated users to a login screen.
- **Real-Time Database:** Integrates with Firebase Cloud Firestore to store survey responses with server-side timestamps and fetch aggregate data for the dashboard.

## Tech Stack

- **Frontend:** React, React Router (`react-router-dom`), vanilla CSS
- **Build Tool:** Vite + SWC/Babel Fast Refresh
- **Backend/BaaS:** Firebase (Cloud Firestore, Authentication)

---

## Local Installation & Setup

To run this project locally, ensure you have Node.js installed, then follow these steps:

**1. Clone the repository and navigate into the directory:**

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

**2. Run commands in terminal:**

```bash
npm install
npm run dev
```
