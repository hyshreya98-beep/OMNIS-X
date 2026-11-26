# OMNIS-X — Intelligent Institutional Digital Twin

This project is a college demonstration application. It contains a React + TypeScript frontend, a FastAPI backend and an SQLite database.

## Important before running

- The project ZIP intentionally does **not** contain `backend/.env`, API keys, the Python virtual environment or the local SQLite database.
- Keep your existing `backend/.env` file. It must contain `GEMINI_API_KEY=your_key`.
- Never share the `.env` file or publish the API key.
- All preloaded records are fictional demonstration data. Replace them with authorized institutional data before real use.

## Run the backend (Windows PowerShell)

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

If your virtual environment already exists and contains the dependencies, activate it and run only the last command from the project root:

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

Keep this terminal open. API documentation: http://127.0.0.1:8000/docs

## Run the frontend

Open a second terminal at the project root:

```powershell
npm install
npm run dev
```

Open the exact localhost URL printed by Vite.

## Connected modules

| Module | What it does | Backend connection |
|---|---|---|
| Timetable | Create, list and delete class schedules; prevents same-time room/faculty conflicts | SQLite `module_records`, `/api/modules/timetable` |
| Attendance | Record Present, Absent, Late or Leave entries | SQLite `module_records`, `/api/modules/attendance` |
| Examinations | Manage exam schedules; prevents same-date/time/hall conflicts | SQLite `module_records`, `/api/modules/examinations` |
| Infrastructure | Register facilities, capacity and availability | SQLite `module_records`, `/api/modules/infrastructure` |
| Transportation | Manage routes, vehicles, drivers, seats and status | SQLite `module_records`, `/api/modules/transportation` |
| Hostel | Manage room allocation; prevents duplicate allocation of an occupied room | SQLite `module_records`, `/api/modules/hostel` |
| Placements | Maintain company drives, roles, dates, packages and eligibility notes | SQLite `module_records`, `/api/modules/placements` |
| Events | Manage event dates, venues and organizers; prevents same-venue/date booking conflicts | SQLite `module_records`, `/api/modules/events` |
| Requests & Approvals | Record requests and update their status using the status selector | SQLite `module_records`, `/api/modules/requests-approvals` |
| Reports | Summarizes the connected module records and incident report | Reads the module API data |
| Settings | Saves institution name, notification preference and dark mode | SQLite `app_settings`, `/api/settings` |

## Core OMNIS-X failure workflow

The existing demonstration workflow remains available:

1. Simulate a Computer Lab 1 electricity failure.
2. Review affected session, direct and cascading impacts.
3. Check alternative resources and the proposed recovery plan.
4. Ask Gemini to explain the validated demo data.
5. Record Principal/Main Admin approval.
6. Record a simulated recovery execution only after approval.
7. Generate the incident audit report.

The failure scenario is fictional. Recovery execution records a demonstration event; it does not change a real timetable, move students or control physical campus equipment.

## Data and security notes

- Module records and settings persist in `backend/omnis_x.db`.
- The sample role selector is for demonstration only; it is not secure login or authorization.
- The API currently uses a local development CORS allowlist. If Vite selects a different port, add that exact localhost origin to `backend/main.py`.
- Do not use this demo for real attendance, student records, transport safety, hostel allocation or official institutional decisions until authentication, authorization, audit controls, backups and privacy safeguards are implemented.
