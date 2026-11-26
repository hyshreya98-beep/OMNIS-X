from backend.database import get_connection
from backend.simulation import simulate_failure
from backend.approvals import (
    get_latest_recovery_decision,
    get_latest_recovery_execution,
)


def generate_incident_report(incident_id: str):
    simulation = simulate_failure()

    approval = get_latest_recovery_decision(incident_id)
    execution = get_latest_recovery_execution(incident_id)

    if not simulation.get("success"):
        raise ValueError("Unable to generate incident report.")

    return {
        "incident_id": incident_id,
        "incident": simulation["scenario"],
        "institution": simulation["institution"],
        "failure": simulation["failure"],
        "affected_session": simulation["session"],
        "affected_resources": simulation["affected_resources"],
        "direct_impacts": simulation["direct_impacts"],
        "cascading_impacts": simulation["cascading_impacts"],
        "alternative_resource_checks": simulation[
            "alternative_resources"
        ],
        "recovery_proposal": simulation["recovery_plan"],
        "approval_record": approval,
        "execution_record": execution,
        "incident_status": (
            "RECOVERY EXECUTED - DEMONSTRATION"
            if execution and execution["status"] == "APPLIED"
            else "AWAITING RECOVERY"
            if not execution
            else "RECOVERY NOT APPLIED"
        ),
        "data_note": simulation["data_note"],
    }