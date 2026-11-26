import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "omnis_x.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            code TEXT NOT NULL UNIQUE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usn TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            semester INTEGER NOT NULL,
            section TEXT NOT NULL,
            attendance REAL DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            designation TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS infrastructure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resource_name TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            capacity INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Available'
        )
    """)


    cursor.execute("""
        CREATE TABLE IF NOT EXISTS module_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module TEXT NOT NULL,
            data_json TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_module_records_module
        ON module_records(module)
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_settings (
            setting_key TEXT PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    departments = [
        ("Computer Science and Engineering", "CSE"),
        ("Electronics and Communication", "ECE"),
        ("Electrical and Electronics", "EEE"),
        ("Mechanical Engineering", "ME"),
        ("Civil Engineering", "CE")
    ]

    for name, code in departments:
        cursor.execute("""
            INSERT OR IGNORE INTO departments (name, code)
            VALUES (?, ?)
        """, (name, code))

    students = [
        ("KITCSE001", "Aarav Sharma", "CSE", 5, "A", 92),
        ("KITCSE002", "Ananya Rao", "CSE", 5, "A", 88),
        ("KITCSE003", "Rohan Kumar", "CSE", 5, "A", 85),
        ("KITCSE004", "Diya Shetty", "CSE", 5, "A", 91),
        ("KITCSE005", "Kiran Patil", "CSE", 5, "A", 79),
        ("KITCSE006", "Meera Nair", "CSE", 5, "A", 95),
        ("KITCSE007", "Aditya Reddy", "CSE", 5, "A", 87),
        ("KITCSE008", "Sneha Gowda", "CSE", 5, "A", 90),
        ("KITCSE009", "Vikram Das", "CSE", 5, "A", 82),
        ("KITCSE010", "Pooja Hegde", "CSE", 5, "A", 89),

        ("KITECE001", "Ishaan Verma", "ECE", 5, "A", 86),
        ("KITECE002", "Nisha Rao", "ECE", 5, "A", 91),
        ("KITECE003", "Arjun Das", "ECE", 5, "A", 84),
        ("KITECE004", "Kavya Shetty", "ECE", 5, "A", 93),
        ("KITECE005", "Rahul Nair", "ECE", 5, "A", 80),

        ("KITEEE001", "Sanjay Kumar", "EEE", 5, "A", 88),
        ("KITEEE002", "Aditi Rao", "EEE", 5, "A", 92),
        ("KITEEE003", "Manoj Patil", "EEE", 5, "A", 81),
        ("KITEEE004", "Neha Sharma", "EEE", 5, "A", 90),
        ("KITEEE005", "Varun Das", "EEE", 5, "A", 85),

        ("KITME001", "Akash Gowda", "ME", 5, "A", 87),
        ("KITME002", "Riya Nair", "ME", 5, "A", 94),
        ("KITME003", "Karthik Rao", "ME", 5, "A", 83),
        ("KITME004", "Sahana Patil", "ME", 5, "A", 89),
        ("KITME005", "Nikhil Shetty", "ME", 5, "A", 86),

        ("KITCE001", "Pranav Kumar", "CE", 5, "A", 90),
        ("KITCE002", "Isha Verma", "CE", 5, "A", 88),
        ("KITCE003", "Deepak Rao", "CE", 5, "A", 82),
        ("KITCE004", "Tanya Das", "CE", 5, "A", 93),
        ("KITCE005", "Mohit Nair", "CE", 5, "A", 85)
    ]

    for student in students:
        cursor.execute("""
            INSERT OR IGNORE INTO students
            (usn, name, department, semester, section, attendance)
            VALUES (?, ?, ?, ?, ?, ?)
        """, student)

    faculty_members = [
        ("FAC001", "Dr. Meera Sharma", "CSE", "Professor"),
        ("FAC002", "Prof. Arjun Rao", "CSE", "Assistant Professor"),
        ("FAC003", "Prof. Kavya Nair", "CSE", "Assistant Professor"),
        ("FAC004", "Dr. Rahul Kumar", "ECE", "Professor"),
        ("FAC005", "Prof. Sneha Das", "ECE", "Assistant Professor"),
        ("FAC006", "Dr. Vikram Patil", "EEE", "Professor"),
        ("FAC007", "Prof. Ananya Rao", "EEE", "Assistant Professor"),
        ("FAC008", "Dr. Kiran Shetty", "ME", "Professor"),
        ("FAC009", "Prof. Diya Gowda", "ME", "Assistant Professor"),
        ("FAC010", "Dr. Rohan Nair", "CE", "Professor")
    ]

    for faculty in faculty_members:
        cursor.execute("""
            INSERT OR IGNORE INTO faculty
            (faculty_code, name, department, designation)
            VALUES (?, ?, ?, ?)
        """, faculty)

    resources = [
        ("Computer Lab 1", "Laboratory", 30, "Available"),
        ("Computer Lab 2", "Laboratory", 35, "Available"),
        ("Physics Lab", "Laboratory", 30, "Available"),
        ("Classroom 101", "Classroom", 60, "Available"),
        ("Classroom 102", "Classroom", 60, "Available"),
        ("Seminar Hall", "Hall", 150, "Available"),
        ("Library", "Facility", 100, "Available"),
        ("Main Generator", "Power Supply", 1, "Available"),
        ("Campus Internet", "Network", 1, "Available")
    ]

    for resource in resources:
        cursor.execute("""
            INSERT INTO infrastructure
            (resource_name, resource_type, capacity, status)
            SELECT ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM infrastructure WHERE resource_name = ?
            )
        """, (*resource, resource[0]))


    demo_module_records = {
        "timetable": [
            {"day": "Monday", "time": "10:00 AM - 11:00 AM", "department": "CSE", "semester": "5th Semester", "subject": "Artificial Intelligence", "faculty": "Demo Faculty", "room": "Room 101"},
            {"day": "Tuesday", "time": "11:00 AM - 12:00 PM", "department": "CSE", "semester": "5th Semester", "subject": "Database Management", "faculty": "Demo Faculty", "room": "Lab 1"}
        ],
        "attendance": [
            {"student": "Demo Student 1", "usn": "DEMO001", "date": "2026-11-26", "subject": "Artificial Intelligence", "status": "Present"},
            {"student": "Demo Student 2", "usn": "DEMO002", "date": "2026-11-26", "subject": "Database Management", "status": "Absent"}
        ],
        "examinations": [
            {"exam": "Internal Assessment 1", "subject": "Artificial Intelligence", "semester": "5th Semester", "date": "2026-12-05", "time": "10:00 AM", "room": "Exam Hall 1"}
        ],
        "transportation": [
            {"route": "Tiptur - Davangere", "vehicle": "DEMO KA 06 AB 1234", "driver": "Demo Driver", "time": "8:00 AM", "seats": 20, "status": "Active"}
        ],
        "hostel": [
            {"student": "Demo Student 1", "usn": "DEMO001", "block": "A Block", "room": "101", "contact": "Demo contact", "status": "Allocated"}
        ],
        "placements": [
            {"company": "Demo Technologies", "role": "Software Engineer", "date": "2026-12-15", "package": "5 LPA", "eligibility": "CSE - Demo criteria", "status": "Upcoming"}
        ],
        "events": [
            {"event": "Technical Fest", "date": "2026-12-10", "venue": "Seminar Hall", "organizer": "CSE Department", "description": "Sample technical event"}
        ],
         "requests-approvals": [
            {"request": "Computer Lab Booking", "requestedBy": "Demo Faculty", "department": "CSE", "date": "2026-11-26", "status": "Pending"}
        ],
        "infrastructure": [
            {"resource_name": "Computer Lab 1", "resource_type": "Laboratory", "capacity": 30, "status": "Available"},
            {"resource_name": "Computer Lab 2", "resource_type": "Laboratory", "capacity": 35, "status": "Available"},
            {"resource_name": "Seminar Hall", "resource_type": "Hall", "capacity": 150, "status": "Available"}
        ]
    }
    import json
    for module_name, demo_records in demo_module_records.items():
        count = cursor.execute(
            "SELECT COUNT(*) FROM module_records WHERE module = ?",
            (module_name,)
        ).fetchone()[0]
        if count == 0:
            for demo_record in demo_records:
                cursor.execute(
                    "INSERT INTO module_records (module, data_json) VALUES (?, ?)",
                    (module_name, json.dumps(demo_record, ensure_ascii=False))
                )

    connection.commit()
    connection.close()


if __name__ == "__main__":
    initialize_database()
    print("OMNIS-X database initialized successfully.")