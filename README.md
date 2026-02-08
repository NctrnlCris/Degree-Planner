# On-Track 
### Transforming Workday chaos into a clear graduation roadmap.

**On-Track** is a student-first dashboard that replaces the confusing Workday "Academic Progress" UI. By parsing the raw Workday CSV exports using Pandas and visualizing the results with React, we provide students with a high-fidelity, actionable view of their degree status to support their education needs.

---

## Features
* **Workday Parser:** Instantly converts messy `.csv` exports into structured data.
* **Visual Analytics:** Real-time progress rings for degree requirements.
* **Automated Lists:** Categorizes courses into Completed, In Progress, and Incomplete.
* **Lightweight UI:** Custom-built components for maximum speed and zero bloat.

---

## Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Backend:** Python, Flask, Pandas
* **Tooling:** Node.js, npm

---

## Getting Started

### 1. Backend (Python)
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
pip install flask flask-cors pandas

# Start the server
python app.py
```

### 2. Frontend (Typescript)
```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
