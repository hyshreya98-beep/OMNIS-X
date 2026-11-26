from typing import Any
from datetime import datetime, timezone

from backend.approvals import (
    get_latest_recovery_decision,
    save_recovery_execution,
    get_latest_recovery_execution,
)


# Fictional demonstration scenario.
DEMO_SCENARIO = {
    "institution": "Kalpataru Institute of Technology - Demo",
    "failure": {
        "resource_id": "LAB-01",
        "resource_name": "Computer Lab 1",
        "failure_type": "Electricity Failure",
        "description": "Power supply to Computer Lab 1 has stopped.",
    },
    "class_session": {
        "course": "Computer Science Practical",
        "department": "CSE",
        "faculty": "Faculty A",
        "students": 30,
        "start_time": "10:00 AM",
        "end_time": "12:00 PM",
    },
    "resources": [
        {
            "id": "LAB-01",
            "name": "Computer Lab 1",
            "type": "Computer Lab",
            "capacity": 30,
            "electricity": False,
            "internet": True,
            "available": False,
        },
        {
            "id": "LAB-02",
            "name": "Computer Lab 2",
            "type": "Computer Lab",
            "capacity": 35,
            "electricity": True,
            "internet": True,
            "available": True,
        },
    ],
}


INCIDENT_ID = "DEMO-LAB01-ELECTRICITY-001"


def simulate_failure() -> dict[str, Any]:
    scenario = DEMO_SCENARIO
    failure = scenario["failure"]
    session = scenario["class_session"]

    affected_resource = next(
        (
            resource
            for resource in scenario["resources"]
            if resource["id"] == failure["resource_id"]
        ),
        None,
    )

    if affected_resource is None:
        return {
            "success": False,
            "message": "Failed resource was not found.",
        }

    impacts = [
        {
            "type": "Infrastructure",
            "item": affected_resource["name"],
            "impact": "Unavailable due to electricity failure.",
        },
        {
            "type": "Academic Session",
            "item": session["course"],
            "impact": "Cannot continue in the affected laboratory.",
        },
        {
            "type": "Faculty",
            "item": session["faculty"],
            "impact": "Practical session is interrupted.",
        },
        {
            "type": "Students",
            "item": f'{session["students"]} CSE students',
            "impact": "Students cannot continue the practical in Lab 1.",
        },
    ]

    alternatives = []

    for resource in scenario["resources"]:
        if resource["id"] == affected_resource["id"]:
            continue

        checks = {
            "correct_type": resource["type"] == "Computer Lab",
            "enough_capacity": resource["capacity"] >= session["students"],
            "electricity_available": resource["electricity"],
            "internet_available": resource["internet"],
            "resource_available": resource["available"],
        }

        eligible = all(checks.values())

        alternatives.append({
            "resource_id": resource["id"],
            "resource_name": resource["name"],
            "eligible": eligible,
            "capacity": resource["capacity"],
            "required_capacity": session["students"],
            "checks": checks,
            "decision": (
                "Eligible for proposed relocation."
                if eligible
                else "Not eligible. One or more constraints failed."
            ),
        })

    valid_alternatives = [
        option for option in alternatives if option["eligible"]
    ]

    recovery = {
        "status": "PROPOSED - AWAITING APPROVAL",
        "recommended_action": (
            f'Move the practical session to {valid_alternatives[0]["resource_name"]}.'
            if valid_alternatives
            else "No valid alternative resource found."
        ),
        "options": valid_alternatives,
        "approval_required": True,
        "applied": False,
    }

    return {
        "success": True,
        "scenario": "Computer Lab 1 Electricity Failure",
        "incident_id": INCIDENT_ID,
        "institution": scenario["institution"],
        "failure": failure,
        "session": session,
        "simulation_time": datetime.now(timezone.utc).isoformat(),
        "affected_people_count": session["students"] + 1,
        "affected_resources": [affected_resource["name"]],
        "direct_impacts": impacts,
        "cascading_impacts": [
            {
                "item": session["course"],
                "reason": "The practical session depends on the unavailable lab.",
            },
            {
                "item": f'{session["students"]} students and {session["faculty"]}',
                "reason": "They are directly connected to this practical session.",
            },
        ],
        "alternative_resources": alternatives,
        "recovery_plan": recovery,
        "system_decision": (
            "A valid alternative was found. Approval is required before recovery."
            if valid_alternatives
            else "No valid recovery option is currently available."
        ),
        "incident_status": "DETECTED - NOT YET RESOLVED",
        "data_note": "Fictional demonstration scenario, not live campus data.",
    }


def execute_approved_recovery(incident_id: str) -> dict[str, Any]:
    if incident_id != INCIDENT_ID:
        raise ValueError("Unknown demonstration incident.")

    approval = get_latest_recovery_decision(incident_id)

    if not approval or approval["decision"] != "APPROVED":
        raise ValueError(
            "Recovery cannot execute without a recorded approval."
        )

    previous_execution = get_latest_recovery_execution(incident_id)

    if previous_execution and previous_execution["status"] == "APPLIED":
        return {
            "success": True,
            "message": "Recovery was already executed for this incident.",
            "execution": previous_execution,
        }

    session = DEMO_SCENARIO["class_session"]

    target = next(
        (
            resource
            for resource in DEMO_SCENARIO["resources"]
            if resource["id"] == "LAB-02"
        ),
        None,
    )

    if target is None:
        raise ValueError("Alternative laboratory was not found.")

    checks = {
        "correct_type": target["type"] == "Computer Lab",
        "enough_capacity": target["capacity"] >= session["students"],
        "electricity_available": target["electricity"],
        "internet_available": target["internet"],
        "resource_available": target["available"],
    }

    if not all(checks.values()):
        raise ValueError(
            "Recovery stopped because Lab 2 failed one or more constraints."
        )

    execution = save_recovery_execution(
        incident_id=incident_id,
        action="Simulated practical session relocation",
        target_resource=target["name"],
        status="APPLIED",
        details=(
            "Recovery recorded after approval and constraint revalidation. "
            "This is a demonstration only; no real timetable or campus "
            "resource was changed."
        ),
    )

    return {
        "success": True,
        "message": "Approved recovery was successfully recorded.",
        "execution": execution,
        "checks": checks,
        "incident_status": "MITIGATED - DEMONSTRATION RECOVERY RECORDED",
        "data_note": (
            "Fictional demonstration only. Lab 1 remains unavailable; "
            "no real campus relocation was performed."
        ),
    }