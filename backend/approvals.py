from datetime import datetime, timezone

from backend.database import get_connection


ALLOWED_APPROVER_ROLES = {
    "principal",
    "main admin",
}


def initialize_approval_table():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS recovery_approvals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT NOT NULL,
            decision TEXT NOT NULL,
            approver_name TEXT NOT NULL,
            approver_role TEXT NOT NULL,
            comments TEXT DEFAULT '',
            decided_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS recovery_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT NOT NULL,
            action TEXT NOT NULL,
            target_resource TEXT NOT NULL,
            status TEXT NOT NULL,
            executed_at TEXT NOT NULL,
            details TEXT DEFAULT ''
        )
    """)

    connection.commit()
    connection.close()


def submit_recovery_decision(
    incident_id,
    decision,
    approver_name,
    approver_role,
    comments=""
):
    decision = decision.strip().upper()
    approver_role = approver_role.strip().lower()
    approver_name = approver_name.strip()

    if decision not in {"APPROVED", "REJECTED"}:
        raise ValueError("Decision must be APPROVED or REJECTED.")

    if approver_role not in ALLOWED_APPROVER_ROLES:
        raise ValueError(
            "Only the Principal or Main Admin can decide recovery."
        )

    if not approver_name:
        raise ValueError("Approver name is required.")

    if not incident_id:
        raise ValueError("Incident ID is required.")

    decided_at = datetime.now(timezone.utc).isoformat()

    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO recovery_approvals (
            incident_id,
            decision,
            approver_name,
            approver_role,
            comments,
            decided_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        incident_id,
        decision,
        approver_name,
        approver_role,
        comments.strip(),
        decided_at
    ))

    connection.commit()

    record = connection.execute(
        "SELECT * FROM recovery_approvals WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    result = dict(record)
    connection.close()

    return result


def get_latest_recovery_decision(incident_id):
    connection = get_connection()

    record = connection.execute("""
        SELECT *
        FROM recovery_approvals
        WHERE incident_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (incident_id,)).fetchone()

    connection.close()

    return dict(record) if record else None


def save_recovery_execution(
    incident_id,
    action,
    target_resource,
    status,
    details=""
):
    executed_at = datetime.now(timezone.utc).isoformat()

    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO recovery_executions (
            incident_id,
            action,
            target_resource,
            status,
            executed_at,
            details
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        incident_id,
        action,
        target_resource,
        status,
        executed_at,
        details
    ))

    connection.commit()

    record = connection.execute(
        "SELECT * FROM recovery_executions WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    result = dict(record)
    connection.close()

    return result


def get_latest_recovery_execution(incident_id):
    connection = get_connection()

    record = connection.execute("""
        SELECT *
        FROM recovery_executions
        WHERE incident_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (incident_id,)).fetchone()

    connection.close()

    return dict(record) if record else None