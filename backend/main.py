from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any

from backend.database import initialize_database, get_connection
from backend.simulation import simulate_failure
from backend.approvals import (
    initialize_approval_table,
    submit_recovery_decision,
    get_latest_recovery_decision,
    get_latest_recovery_execution,
)
from backend.incident_reports import generate_incident_report
from backend.ai_explainer import generate_ai_explanation


app = FastAPI(
    title="OMNIS-X",
    description="Intelligent Institutional Digital Twin",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:5176", "http://127.0.0.1:5176",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class ModuleRecordCreate(BaseModel):
    data: dict[str, Any]


class SettingsUpdate(BaseModel):
    settings: dict[str, Any]


class RecoveryDecision(BaseModel):
    incident_id: str = Field(min_length=1)
    decision: str
    approver_name: str = Field(min_length=1)
    approver_role: str = Field(min_length=1)
    comments: str = ""


@app.on_event("startup")
def startup_event():
    initialize_database()
    initialize_approval_table()
    print("OMNIS-X database connected successfully.")
    print("Recovery approval system initialized.")
    print("Gemini AI explanation module loaded.")


@app.get("/")
def home():
    return {
        "system": "OMNIS-X",
        "message": "Intelligent Institutional Digital Twin is running",
        "status": "Operational"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "database": "Connected",
        "system": "OMNIS-X"
    }


@app.get("/api/dashboard")
def dashboard():
    connection = get_connection()

    students = connection.execute(
        "SELECT COUNT(*) FROM students"
    ).fetchone()[0]

    faculty = connection.execute(
        "SELECT COUNT(*) FROM faculty"
    ).fetchone()[0]

    departments = connection.execute(
        "SELECT COUNT(*) FROM departments"
    ).fetchone()[0]

    resources = connection.execute(
        "SELECT COUNT(*) FROM infrastructure"
    ).fetchone()[0]

    connection.close()

    return {
        "students": students,
        "faculty": faculty,
        "departments": departments,
        "resources": resources,
        "active_incidents": 0
    }


@app.get("/api/students")
def get_students():
    connection = get_connection()
    records = connection.execute(
        "SELECT * FROM students ORDER BY id"
    ).fetchall()
    connection.close()
    return [dict(record) for record in records]


@app.get("/api/faculty")
def get_faculty():
    connection = get_connection()
    records = connection.execute(
        "SELECT * FROM faculty ORDER BY id"
    ).fetchall()
    connection.close()
    return [dict(record) for record in records]


@app.get("/api/departments")
def get_departments():
    connection = get_connection()
    records = connection.execute(
        "SELECT * FROM departments ORDER BY id"
    ).fetchall()
    connection.close()
    return [dict(record) for record in records]


@app.get("/api/infrastructure")
def get_infrastructure():
    connection = get_connection()
    records = connection.execute(
        "SELECT * FROM infrastructure ORDER BY id"
    ).fetchall()
    connection.close()
    return [dict(record) for record in records]


@app.post("/api/simulate-failure")
def run_failure_simulation():
    return simulate_failure()


@app.post("/api/recovery-decision")
def make_recovery_decision(request: RecoveryDecision):
    try:
        result = submit_recovery_decision(
            incident_id=request.incident_id,
            decision=request.decision,
            approver_name=request.approver_name,
            approver_role=request.approver_role,
            comments=request.comments
        )

        return {
            "message": "Recovery decision recorded successfully.",
            "approval": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get("/api/recovery-decision/{incident_id}")
def read_recovery_decision(incident_id: str):
    result = get_latest_recovery_decision(incident_id)

    return {
        "approval": result
    }


@app.get("/api/recovery-execution/{incident_id}")
def read_recovery_execution(incident_id: str):
    result = get_latest_recovery_execution(incident_id)

    return {
        "execution": result
    }


@app.get("/api/incident-report/{incident_id}")
def read_incident_report(incident_id: str):
    try:
        return generate_incident_report(incident_id)

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get("/api/ai-explanation/{incident_id}")
def get_ai_explanation(incident_id: str):

    incident_data = simulate_failure()

    if not incident_data.get("success"):
        raise HTTPException(
            status_code=400,
            detail="Incident simulation data is unavailable."
        )

    if incident_data.get("incident_id") != incident_id:
        raise HTTPException(
            status_code=404,
            detail="Incident not found."
        )

    result = generate_ai_explanation(incident_data)

    if not result.get("success"):
        raise HTTPException(
            status_code=502,
            detail=result.get("message", "AI explanation failed.")
        )

    return result

# Persistent institutional modules. All records are stored in SQLite.
MODULE_NAMES = {
    "timetable", "attendance", "examinations",
    "transportation", "hostel", "placements", "events",
    "requests-approvals", "infrastructure"
}


def _module_rows(module: str):
    if module not in MODULE_NAMES:
        raise HTTPException(status_code=404, detail="Unknown institutional module.")
    connection = get_connection()
    rows = connection.execute(
        "SELECT id, data_json, created_at, updated_at FROM module_records WHERE module = ? ORDER BY id DESC",
        (module,)
    ).fetchall()
    connection.close()
    import json
    return [
        {"id": row["id"], **json.loads(row["data_json"]),
         "created_at": row["created_at"], "updated_at": row["updated_at"]}
        for row in rows
    ]


@app.get("/api/modules/{module}")
def list_module_records(module: str):
    return _module_rows(module)


@app.post("/api/modules/{module}")
def create_module_record(module: str, request: ModuleRecordCreate):
    if module not in MODULE_NAMES:
        raise HTTPException(status_code=404, detail="Unknown institutional module.")
    data = {str(k): v for k, v in request.data.items() if k not in {"id", "created_at", "updated_at"}}
    if not data or any(v is None or str(v).strip() == "" for v in data.values()):
        raise HTTPException(status_code=400, detail="Please provide all required record fields.")
    # Module-specific validation and conflict checks.
    import json
    connection = get_connection()
    existing_rows = connection.execute(
        "SELECT id, data_json FROM module_records WHERE module = ?", (module,)
    ).fetchall()
    existing = [(row["id"], json.loads(row["data_json"])) for row in existing_rows]

    if module == "attendance" and str(data.get("status", "")).lower() not in {"present", "absent", "late", "leave"}:
        connection.close()
        raise HTTPException(status_code=400, detail="Attendance status must be Present, Absent, Late or Leave.")
    if module == "timetable":
        for _, old in existing:
            same_slot = old.get("day") == data.get("day") and old.get("time") == data.get("time")
            if same_slot and (old.get("room") == data.get("room") or old.get("faculty") == data.get("faculty")):
                connection.close()
                raise HTTPException(status_code=409, detail="Timetable conflict: this room or faculty is already assigned in that time slot.")
    if module == "examinations":
        for _, old in existing:
            if old.get("date") == data.get("date") and old.get("time") == data.get("time") and old.get("room") == data.get("room"):
                connection.close()
                raise HTTPException(status_code=409, detail="Examination hall conflict: this hall is already booked at that date and time.")
    if module == "hostel" and str(data.get("status", "")).lower() == "allocated":
        for _, old in existing:
            if str(old.get("room", "")).lower() == str(data.get("room", "")).lower() and str(old.get("block", "")).lower() == str(data.get("block", "")).lower() and str(old.get("status", "")).lower() == "allocated":
                connection.close()
                raise HTTPException(status_code=409, detail="Hostel room is already allocated.")
    if module == "events":
        for _, old in existing:
            if old.get("date") == data.get("date") and str(old.get("venue", "")).lower() == str(data.get("venue", "")).lower():
                connection.close()
                raise HTTPException(status_code=409, detail="Event venue conflict: this venue is already booked on that date.")
    if module == "transportation":
        try:
            if int(data.get("seats", 0)) < 0:
                raise ValueError()
        except (TypeError, ValueError):
            connection.close()
            raise HTTPException(status_code=400, detail="Available seats must be a non-negative number.")

    cursor = connection.execute(
        "INSERT INTO module_records (module, data_json) VALUES (?, ?)",
        (module, json.dumps(data, ensure_ascii=False))
    )
    connection.commit()
    row = connection.execute(
        "SELECT id, data_json, created_at, updated_at FROM module_records WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()
    connection.close()
    return {"success": True, "record": {
        "id": row["id"], **json.loads(row["data_json"]),
        "created_at": row["created_at"], "updated_at": row["updated_at"]
    }}


@app.put("/api/modules/{module}/{record_id}")
def update_module_record(module: str, record_id: int, request: ModuleRecordCreate):
    if module not in MODULE_NAMES:
        raise HTTPException(status_code=404, detail="Unknown institutional module.")
    import json
    data = {str(k): v for k, v in request.data.items() if k not in {"id", "created_at", "updated_at"}}
    if not data:
        raise HTTPException(status_code=400, detail="Record data is required.")
    connection = get_connection()
    cursor = connection.execute(
        """UPDATE module_records SET data_json = ?, updated_at = CURRENT_TIMESTAMP
           WHERE module = ? AND id = ?""",
        (json.dumps(data, ensure_ascii=False), module, record_id)
    )
    connection.commit()
    if cursor.rowcount == 0:
        connection.close()
        raise HTTPException(status_code=404, detail="Record not found.")
    row = connection.execute(
        "SELECT id, data_json, created_at, updated_at FROM module_records WHERE module = ? AND id = ?",
        (module, record_id)
    ).fetchone()
    connection.close()
    return {"success": True, "record": {
        "id": row["id"], **json.loads(row["data_json"]),
        "created_at": row["created_at"], "updated_at": row["updated_at"]
    }}


@app.delete("/api/modules/{module}/{record_id}")
def delete_module_record(module: str, record_id: int):
    if module not in MODULE_NAMES:
        raise HTTPException(status_code=404, detail="Unknown institutional module.")
    connection = get_connection()
    cursor = connection.execute(
        "DELETE FROM module_records WHERE module = ? AND id = ?",
        (module, record_id)
    )
    connection.commit()
    connection.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found.")
    return {"success": True, "message": "Record deleted successfully."}


@app.get("/api/settings")
def read_settings():
    import json
    connection = get_connection()
    rows = connection.execute(
        "SELECT setting_key, setting_value FROM app_settings"
    ).fetchall()
    connection.close()
    saved = {row["setting_key"]: json.loads(row["setting_value"]) for row in rows}
    defaults = {
        "instituteName": "Kalpataru Institute of Technology",
        "notificationsEnabled": True,
        "darkMode": False
    }
    return {**defaults, **saved}


@app.put("/api/settings")
def update_settings(request: SettingsUpdate):
    import json
    allowed = {"instituteName", "notificationsEnabled", "darkMode"}
    connection = get_connection()
    for key, value in request.settings.items():
        if key not in allowed:
            continue
        connection.execute(
            """INSERT INTO app_settings (setting_key, setting_value)
               VALUES (?, ?)
               ON CONFLICT(setting_key) DO UPDATE SET
               setting_value = excluded.setting_value,
               updated_at = CURRENT_TIMESTAMP""",
            (key, json.dumps(value, ensure_ascii=False))
        )
    connection.commit()
    connection.close()
    return {"success": True, "settings": read_settings()}
