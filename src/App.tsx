import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";
const INCIDENT_ID = "DEMO-LAB01-ELECTRICITY-001";

type RecordItem = Record<string, unknown>;

type DashboardData = {
  students: number;
  faculty: number;
  departments: number;
  resources: number;
  active_incidents: number;
};

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
};

function isRecord(value: unknown): value is RecordItem {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getRecords(value: unknown): RecordItem[] {
  return Array.isArray(value)
    ? value.filter(isRecord)
    : [];
}

function getRecord(value: unknown): RecordItem | null {
  return isRecord(value) ? value : null;
}

function getText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function columnLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API}${path}`, options);

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    const errorData = getRecord(result);

    throw new Error(
      getText(errorData?.detail) ||
      getText(errorData?.message) ||
      "Server request failed."
    );
  }

  return result as T;
}
/* NAVIGATION */

const menuItems = [
  "Dashboard",
  "Digital Twin",
  "Live Failure Demo",
  "Students",
  "Faculty",
  "Departments",
  "Timetable",
  "Attendance",
  "Examinations",
  "Infrastructure",
  "Transportation",
  "Hostel",
  "Placements",
  "Events",
  "Requests & Approvals",
  "Incident History",
  "Reports",
  "Settings"
];

/* MODULE FORM FIELDS */

const moduleFields: Record<string, Field[]> = {
  Infrastructure: [
    { key: "resource_name", label: "Resource Name", placeholder: "Computer Lab 3" },
    { key: "resource_type", label: "Resource Type", placeholder: "Laboratory" },
    { key: "capacity", label: "Capacity", placeholder: "40", type: "number" },
    { key: "status", label: "Status", placeholder: "Available / Maintenance / Unavailable" }
  ],

  Timetable: [
    { key: "day", label: "Day", placeholder: "Monday" },
    { key: "time", label: "Time", placeholder: "10:00 AM - 11:00 AM" },
    { key: "department", label: "Department", placeholder: "CSE" },
    { key: "semester", label: "Semester", placeholder: "5th Semester" },
    { key: "subject", label: "Subject", placeholder: "Artificial Intelligence" },
    { key: "faculty", label: "Faculty", placeholder: "Faculty name" },
    { key: "room", label: "Room", placeholder: "Classroom 101" }
  ],

  Attendance: [
    { key: "student", label: "Student Name", placeholder: "Student name" },
    { key: "usn", label: "USN", placeholder: "USN number" },
    { key: "date", label: "Date", type: "date" },
    { key: "subject", label: "Subject", placeholder: "Subject name" },
    { key: "status", label: "Status", placeholder: "Present / Absent" }
  ],

  Examinations: [
    { key: "exam", label: "Exam Name", placeholder: "Internal Assessment 1" },
    { key: "subject", label: "Subject", placeholder: "Subject name" },
    { key: "semester", label: "Semester", placeholder: "5th Semester" },
    { key: "date", label: "Exam Date", type: "date" },
    { key: "time", label: "Time", placeholder: "10:00 AM" },
    { key: "room", label: "Exam Hall", placeholder: "Room 101" }
  ],

  Transportation: [
    { key: "route", label: "Route", placeholder: "Tiptur - Davangere" },
    { key: "vehicle", label: "Vehicle Number", placeholder: "KA 06 AB 1234" },
    { key: "driver", label: "Driver Name", placeholder: "Driver name" },
    { key: "time", label: "Departure Time", placeholder: "8:00 AM" },
    { key: "seats", label: "Available Seats", placeholder: "40", type: "number" },
    { key: "status", label: "Status", placeholder: "Active / Inactive" }
  ],

  Hostel: [
    { key: "student", label: "Student Name", placeholder: "Student name" },
    { key: "usn", label: "USN", placeholder: "USN number" },
    { key: "block", label: "Hostel Block", placeholder: "A Block" },
    { key: "room", label: "Room Number", placeholder: "101" },
    { key: "contact", label: "Contact", placeholder: "Contact number" },
    { key: "status", label: "Status", placeholder: "Allocated / Vacant" }
  ],

  Placements: [
    { key: "company", label: "Company", placeholder: "Company name" },
    { key: "role", label: "Job Role", placeholder: "Software Engineer" },
    { key: "date", label: "Drive Date", type: "date" },
    { key: "package", label: "Package", placeholder: "5 LPA" },
    { key: "eligibility", label: "Eligibility", placeholder: "CGPA / branch criteria" },
    { key: "status", label: "Status", placeholder: "Upcoming / Completed" }
  ],

  Events: [
    { key: "event", label: "Event Name", placeholder: "Technical Fest" },
    { key: "date", label: "Date", type: "date" },
    { key: "venue", label: "Venue", placeholder: "Seminar Hall" },
    { key: "organizer", label: "Organizer", placeholder: "Department / Club" },
    { key: "description", label: "Description", placeholder: "Event details" }
  ],

  "Requests & Approvals": [
    { key: "request", label: "Request", placeholder: "Lab change request" },
    { key: "requestedBy", label: "Requested By", placeholder: "Name" },
    { key: "department", label: "Department", placeholder: "CSE" },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", placeholder: "Pending / Approved / Rejected" }
  ]
};

const moduleSlugs: Record<string, string> = {
  Timetable: "timetable",
  Attendance: "attendance",
  Examinations: "examinations",
  Transportation: "transportation",
  Hostel: "hostel",
  Placements: "placements",
  Events: "events",
  "Requests & Approvals": "requests-approvals",
  Infrastructure: "infrastructure"
};

const descriptions: Record<string, string> = {
  Infrastructure: "Register campus rooms, laboratories and facilities, track capacity and update availability.",
  Timetable: "Create and view class schedules by day, time, subject, faculty and classroom.",
  Attendance: "Add attendance entries and view student attendance records.",
  Examinations: "Manage examination schedules, subjects, dates and examination halls.",
  Transportation: "Manage bus routes, vehicle details, drivers and seat availability.",
  Hostel: "Manage hostel room allocation and student accommodation records.",
  Placements: "Manage company details, placement drives, job roles and packages.",
  Events: "Create and manage college events, venues and organizers."
};

/* DATA TABLE */

function DataTable({
  records,
  onDelete,
  onStatusChange
}: {
  records: RecordItem[];
  onDelete?: (id: unknown) => void;
  onStatusChange?: (id: unknown, status: string) => void;
}) {
  if (!records.length) {
    return <p className="empty-state">No records available.</p>;
  }

  const columns = Array.from(
    new Set(records.flatMap((record) => Object.keys(record)))
  );

  const statuses = [
    "Pending", "Approved", "Rejected",
    "Present", "Absent", "Late", "Leave",
    "Active", "Inactive", "Available",
    "Maintenance", "Unavailable",
    "Allocated", "Vacant", "Upcoming", "Completed"
  ];

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{columnLabel(column)}</th>
            ))}
            {(onDelete || onStatusChange) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => (
            <tr key={String(record.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>
                  {formatValue(record[column])}
                </td>
              ))}

              {(onDelete || onStatusChange) && (
                <td className="table-actions">
                  {onStatusChange &&
                    typeof record.status === "string" && (
                      <select
                        aria-label="Update record status"
                        value={record.status}
                        onChange={(event) =>
                          onStatusChange(record.id, event.target.value)
                        }
                      >
                        {Array.from(
                          new Set([...statuses, record.status])
                        ).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}

                  {onDelete && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onDelete(record.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* MODULE WORKSPACE */

function ModuleWorkspace({
  title,
  description,
  records,
  onAdd,
  onDelete,
  onStatusChange
}: {
  title: string;
  description: string;
  records: RecordItem[];
  onAdd: (record: RecordItem) => Promise<void>;
  onDelete: (id: unknown) => void;
  onStatusChange: (id: unknown, status: string) => void;
}) {
  const fields = moduleFields[title] || [];

  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      await onAdd({ ...values });
      setValues({});
      setMessage("Record saved successfully.");
    } catch {
      setMessage("Unable to save record. Please check the backend error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title} Management</h2>
        <span className="healthy-tag">{records.length} Records</span>
      </div>

      <p>{description}</p>

      <div className="notice">
        These records are loaded from and saved to the OMNIS-X database.
      </div>

      <h3>Add New {title} Record</h3>

      <form onSubmit={submitRecord}>
        <div className="stats-grid">
          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={`${title}-${field.key}`}>
                {field.label}
              </label>

              <input
                id={`${title}-${field.key}`}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={values[field.key] || ""}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [field.key]: event.target.value
                  }))
                }
                required
              />
            </div>
          ))}
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Add Record"}
        </button>
      </form>

      {message && <p className="notice">{message}</p>}

      <h3>Available {title} Records</h3>

      <DataTable
        records={records}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </section>
  );
}

/* DIGITAL TWIN */

function CampusConnectivityMap() {
  const rooms = [
    { name: "Main Block", type: "Campus Hub", status: "CONNECTED", color: "#2563eb" },
    { name: "Classroom 1", type: "Classroom", status: "CONNECTED", color: "#16a34a" },
    { name: "Classroom 2", type: "Classroom", status: "CONNECTED", color: "#16a34a" },
    { name: "Computer Lab 1", type: "Computer Lab", status: "FAILED", color: "#dc2626" },
    { name: "Computer Lab 2", type: "Alternative Lab", status: "AVAILABLE", color: "#16a34a" },
    { name: "Seminar Hall", type: "Shared Facility", status: "CONNECTED", color: "#16a34a" }
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Institutional Digital Twin</h2>
        <span className="healthy-tag">Demo View</span>
      </div>

      <p>Illustrative connectivity between institutional facilities.</p>

      <div className="digital-twin-grid">
        {rooms.map((room) => (
          <div
            key={room.name}
            className="digital-twin-room"
            style={{
              borderColor: room.color,
              background: `${room.color}10`
            }}
          >
            <h3>{room.name}</h3>
            <p>{room.type}</p>
            <strong style={{ color: room.color }}>
              {room.status}
            </strong>
          </div>
        ))}
      </div>

      <div className="notice">
        Sample campus connections only. Actual locations and network status
        must be verified before production use.
      </div>
    </section>
  );
}

/* MAIN APPLICATION */

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [role, setRole] = useState("Main Admin");

  const [data, setData] = useState<DashboardData>({
    students: 0,
    faculty: 0,
    departments: 0,
    resources: 0,
    active_incidents: 0
  });

  const [students, setStudents] = useState<RecordItem[]>([]);
  const [faculty, setFaculty] = useState<RecordItem[]>([]);
  const [departments, setDepartments] = useState<RecordItem[]>([]);

  const [moduleData, setModuleData] = useState<Record<string, RecordItem[]>>({});
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleError, setModuleError] = useState("");
  const [error, setError] = useState("");

  const [simulationResult, setSimulationResult] = useState<RecordItem | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [approverName, setApproverName] = useState("");
  const [approvalComments, setApprovalComments] = useState("");
  const [approval, setApproval] = useState<RecordItem | null>(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [execution, setExecution] = useState<RecordItem | null>(null);
  const [executionMessage, setExecutionMessage] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [executionLoading, setExecutionLoading] = useState(false);

  const [incidentReport, setIncidentReport] = useState<RecordItem | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const [instituteName, setInstituteName] = useState(
    "Kalpataru Institute of Technology"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const canApprove = role === "Main Admin" || role === "Principal";

  /* LOAD SETTINGS */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const saved = await apiRequest<RecordItem>("/api/settings");

        if (cancelled) return;

        setInstituteName(
          getText(saved.instituteName, "Kalpataru Institute of Technology")
        );
        setNotificationsEnabled(
          typeof saved.notificationsEnabled === "boolean"
            ? saved.notificationsEnabled
            : true
        );
        setDarkMode(
          typeof saved.darkMode === "boolean" ? saved.darkMode : false
        );
      } catch {
        if (!cancelled) {
          setSettingsMessage("Could not load saved settings from backend.");
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* DASHBOARD */

  async function loadDashboard() {
    setError("");

    try {
      const result = await apiRequest<DashboardData>("/api/dashboard");
      setData(result);
    } catch {
      setError("Unable to connect to the backend dashboard.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  /* MODULE RECORDS */

  async function loadModuleRecords(page: string) {
    const slug = moduleSlugs[page];
    if (!slug) return;

    setModuleLoading(true);
    setModuleError("");

    try {
      const result = await apiRequest<unknown>(`/api/modules/${slug}`);

      setModuleData((previous) => ({
        ...previous,
        [page]: getRecords(result)
      }));
    } catch (err) {
      setModuleError(
        err instanceof Error ? err.message : `Unable to load ${page}.`
      );
    } finally {
      setModuleLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (moduleSlugs[activePage]) {
        void loadModuleRecords(activePage);
      }

      if (activePage === "Reports") {
        Object.keys(moduleSlugs).forEach((page) => {
          void loadModuleRecords(page);
        });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activePage]);

  /* STUDENTS, FACULTY AND DEPARTMENTS */

  useEffect(() => {
    const endpoints: Record<string, string> = {
      Students: "/api/students",
      Faculty: "/api/faculty",
      Departments: "/api/departments"
    };

    const endpoint = endpoints[activePage];
    if (!endpoint) return;

    let cancelled = false;

    async function loadRecords() {
      try {
        const result = await apiRequest<unknown>(endpoint);

        if (cancelled) return;

        const records = getRecords(result);

        if (activePage === "Students") setStudents(records);
        if (activePage === "Faculty") setFaculty(records);
        if (activePage === "Departments") setDepartments(records);
      } catch {
        if (!cancelled) {
          setError(`Unable to load ${activePage.toLowerCase()} data.`);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  /* APPROVAL AND EXECUTION RECORDS */

  async function loadApprovalAndExecution() {
    const [approvalResult, executionResult] = await Promise.all([
      apiRequest<RecordItem>(`/api/recovery-decision/${INCIDENT_ID}`),
      apiRequest<RecordItem>(`/api/recovery-execution/${INCIDENT_ID}`)
    ]);

    setApproval(getRecord(approvalResult.approval));
    setExecution(getRecord(executionResult.execution));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      try {
        const [approvalResult, executionResult] = await Promise.all([
          apiRequest<RecordItem>(`/api/recovery-decision/${INCIDENT_ID}`),
          apiRequest<RecordItem>(`/api/recovery-execution/${INCIDENT_ID}`)
        ]);

        if (cancelled) return;

        setApproval(getRecord(approvalResult.approval));
        setExecution(getRecord(executionResult.execution));
      } catch {
        // Records may not exist before the first simulation.
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ADD MODULE RECORD */

  async function addModuleRecord(page: string, record: RecordItem) {
    const slug = moduleSlugs[page];
    if (!slug) return;

    setModuleError("");

    try {
      const dataToSave = { ...record };
      delete dataToSave.id;

      const result = await apiRequest<RecordItem>(
        `/api/modules/${slug}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataToSave })
        }
      );

      const savedRecord = getRecord(result.record);

      if (!savedRecord) {
        throw new Error("Backend did not return the saved record.");
      }

      setModuleData((previous) => ({
        ...previous,
        [page]: [savedRecord, ...(previous[page] || [])]
      }));
    } catch (err) {
  const message = err instanceof Error
    ? err.message
    : "Unable to save record.";

  setModuleError(message);
  throw err;
}
  }

  /* DELETE MODULE RECORD */

  async function deleteModuleRecord(page: string, id: unknown) {
    const slug = moduleSlugs[page];

    if (!slug || typeof id !== "number") return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    setModuleError("");

    try {
      await apiRequest(
        `/api/modules/${slug}/${id}`,
        { method: "DELETE" }
      );

      setModuleData((previous) => ({
        ...previous,
        [page]: (previous[page] || []).filter(
          (record) => record.id !== id
        )
      }));
    } catch (err) {
      setModuleError(
        err instanceof Error ? err.message : "Unable to delete record."
      );
    }
  }

  /* UPDATE MODULE STATUS */

  async function updateModuleStatus(
    page: string,
    id: unknown,
    status: string
  ) {
    const slug = moduleSlugs[page];

    if (!slug || typeof id !== "number") return;

    const current = (moduleData[page] || []).find(
      (record) => record.id === id
    );

    if (!current) return;

    setModuleError("");

    try {
      const result = await apiRequest<RecordItem>(
        `/api/modules/${slug}/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { ...current, status }
          })
        }
      );

      const updatedRecord = getRecord(result.record);

      if (!updatedRecord) {
        throw new Error("Backend did not return the updated record.");
      }

      setModuleData((previous) => ({
        ...previous,
        [page]: (previous[page] || []).map((record) =>
          record.id === id ? updatedRecord : record
        )
      }));
    } catch (err) {
      setModuleError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  }

  /* FAILURE SIMULATION */

  async function runSimulation() {
    setSimulationLoading(true);
    setSimulationError("");
    setSimulationResult(null);

    setAiExplanation("");
    setAiError("");
    setIncidentReport(null);
    setApproval(null);
    setExecution(null);

    try {
      const result = await apiRequest<RecordItem>(
        "/api/simulate-failure",
        { method: "POST" }
      );

      setSimulationResult(result);

      await loadApprovalAndExecution().catch(() => undefined);
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : "Unable to run simulation."
      );
    } finally {
      setSimulationLoading(false);
    }
  }

  /* GEMINI AI EXPLANATION */

  async function generateAIExplanation() {
    setAiLoading(true);
    setAiError("");
    setAiExplanation("");

    try {
      const result = await apiRequest<RecordItem>(
        `/api/ai-explanation/${INCIDENT_ID}`
      );

      if (result.success !== true) {
        throw new Error(
          getText(result.message, "Gemini could not generate an explanation.")
        );
      }

      setAiExplanation(
        getText(result.explanation, "No explanation was returned.")
      );
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to connect to Gemini AI."
      );
    } finally {
      setAiLoading(false);
    }
  }

  /* INCIDENT REPORT */

  async function loadIncidentReport() {
    setReportLoading(true);
    setReportError("");

    try {
      const result = await apiRequest<RecordItem>(
        `/api/incident-report/${INCIDENT_ID}`
      );

      setIncidentReport(result);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Unable to load report."
      );
    } finally {
      setReportLoading(false);
    }
  }

  /* APPROVAL */

  async function submitApproval(
    decision: "APPROVED" | "REJECTED"
  ) {
    setApprovalLoading(true);
    setApprovalMessage("");
    setApprovalError("");

    if (!canApprove) {
      setApprovalError(
        "Only Principal or Main Admin can decide recovery."
      );
      setApprovalLoading(false);
      return;
    }

    if (!approverName.trim()) {
      setApprovalError("Enter the approver's name.");
      setApprovalLoading(false);
      return;
    }

    try {
      const result = await apiRequest<RecordItem>(
        "/api/recovery-decision",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident_id: INCIDENT_ID,
            decision,
            approver_name: approverName.trim(),
            approver_role: role,
            comments: approvalComments.trim()
          })
        }
      );

      setApproval(getRecord(result.approval));

      setApprovalMessage(
        `Recovery ${decision.toLowerCase()} successfully.`
      );

      setApprovalComments("");

      await loadApprovalAndExecution();
    } catch (err) {
      setApprovalError(
        err instanceof Error ? err.message : "Unable to save approval."
      );
    } finally {
      setApprovalLoading(false);
    }
  }

  /* EXECUTE RECOVERY */

  async function executeRecovery() {
    setExecutionLoading(true);
    setExecutionMessage("");
    setExecutionError("");

    if (approval?.decision !== "APPROVED") {
      setExecutionError(
        "A recorded approval is required before execution."
      );
      setExecutionLoading(false);
      return;
    }

    try {
      const result = await apiRequest<RecordItem>(
        "/api/execute-recovery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident_id: INCIDENT_ID
          })
        }
      );

      await loadApprovalAndExecution();

      setExecutionMessage(
        getText(result.message, "Recovery execution recorded.")
      );
    } catch (err) {
      setExecutionError(
        err instanceof Error ? err.message : "Unable to execute recovery."
      );
    } finally {
      setExecutionLoading(false);
    }
  }

  /* APPROVAL PANEL */

  function renderApprovalPanel() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Recovery Approval</h2>
          <span className="healthy-tag">
            {formatValue(approval?.decision)}
          </span>
        </div>

        <p>
          Review the proposed move from Computer Lab 1 to Computer Lab 2.
        </p>

        <div className="notice">
          <p><strong>Incident:</strong> {INCIDENT_ID}</p>
          <p><strong>Current role:</strong> {role}</p>
          <p><strong>Saved decision:</strong> {formatValue(approval?.decision)}</p>
        </div>

        <label htmlFor="approver-name">Approver Name</label>

        <input
          id="approver-name"
          value={approverName}
          onChange={(event) => setApproverName(event.target.value)}
          placeholder="Principal or Main Admin name"
          disabled={!canApprove}
        />

        <label htmlFor="approval-comments">Comments</label>

        <textarea
          id="approval-comments"
          rows={3}
          value={approvalComments}
          onChange={(event) => setApprovalComments(event.target.value)}
          placeholder="Enter remarks"
          disabled={!canApprove}
        />

        <div className="operation-row">
          <button
            className="primary-button"
            onClick={() => submitApproval("APPROVED")}
            disabled={approvalLoading || !canApprove}
          >
            {approvalLoading ? "Saving..." : "Approve Recovery"}
          </button>

          <button
            className="primary-button"
            onClick={() => submitApproval("REJECTED")}
            disabled={approvalLoading || !canApprove}
          >
            Reject Recovery
          </button>
        </div>

        {!canApprove && (
          <p className="notice">
            Your selected role cannot approve or reject recovery.
          </p>
        )}

        {approvalMessage && <p className="notice">{approvalMessage}</p>}
        {approvalError && <p className="notice">{approvalError}</p>}

        <h3>Approval Record</h3>

        {approval ? (
          <div className="notice">
            <p>Decision: {formatValue(approval.decision)}</p>
            <p>Approver: {formatValue(approval.approver_name)}</p>
            <p>Role: {formatValue(approval.approver_role)}</p>
            <p>Comments: {formatValue(approval.comments)}</p>
            <p>Date: {formatValue(approval.decided_at)}</p>
          </div>
        ) : (
          <p>No approval recorded.</p>
        )}

        <h3>Recovery Execution</h3>

        {approval?.decision === "APPROVED" ? (
          <button
            className="primary-button"
            onClick={executeRecovery}
            disabled={
              executionLoading || execution?.status === "APPLIED"
            }
          >
            {executionLoading
              ? "Executing..."
              : execution?.status === "APPLIED"
                ? "Recovery Recorded"
                : "Execute Approved Recovery"}
          </button>
        ) : (
          <p className="notice">
            Execution is locked until approval is recorded.
          </p>
        )}

        {executionMessage && <p className="notice">{executionMessage}</p>}
        {executionError && <p className="notice">{executionError}</p>}

        {execution && (
          <div className="notice">
            <p>Status: {formatValue(execution.status)}</p>
            <p>Action: {formatValue(execution.action)}</p>
            <p>Target: {formatValue(execution.target_resource)}</p>
            <p>Details: {formatValue(execution.details)}</p>
          </div>
        )}

        <p className="notice">
          Demonstration only. This records a simulated recovery and does not
          physically move a class or change a real timetable.
        </p>
      </section>
    );
  }

  /* INCIDENT HISTORY */

  function renderIncidentReport() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Incident History</h2>
          <span className="healthy-tag">Incident Records</span>
        </div>

        <p>View the saved failure, approval and recovery execution report.</p>

        <button
          className="primary-button"
          onClick={loadIncidentReport}
          disabled={reportLoading}
        >
          {reportLoading
            ? "Generating..."
            : "Generate / Refresh Incident Report"}
        </button>

        {reportError && <p className="notice">{reportError}</p>}

        {incidentReport && (
          <>
            <div className="notice">
              <p>Incident ID: {formatValue(incidentReport.incident_id)}</p>
              <p>Institution: {formatValue(incidentReport.institution)}</p>
              <p>Incident: {formatValue(incidentReport.incident)}</p>
              <p>Status: {formatValue(incidentReport.incident_status)}</p>
            </div>

            <DataTable records={[incidentReport]} />

            <button
              className="primary-button"
              onClick={() => window.print()}
            >
              Print / Save Report as PDF
            </button>
          </>
        )}
      </section>
    );
  }

  /* REPORTS */

  function renderReports() {
    const reportItems: RecordItem[] = [
      {
        name: "Student Records",
        count: students.length,
        detail: "Backend student records loaded in this session"
      },
      {
        name: "Faculty Records",
        count: faculty.length,
        detail: "Backend faculty records loaded in this session"
      },
      {
        name: "Department Records",
        count: departments.length,
        detail: "Backend department records loaded in this session"
      },
      {
        name: "Infrastructure Records",
        count: (moduleData.Infrastructure || []).length,
        detail: "SQLite infrastructure records"
      },
      {
        name: "Timetable Entries",
        count: (moduleData.Timetable || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Attendance Entries",
        count: (moduleData.Attendance || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Examination Entries",
        count: (moduleData.Examinations || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Transport Records",
        count: (moduleData.Transportation || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Hostel Records",
        count: (moduleData.Hostel || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Placement Records",
        count: (moduleData.Placements || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Events",
        count: (moduleData.Events || []).length,
        detail: "SQLite database records"
      },
      {
        name: "Requests",
        count: (moduleData["Requests & Approvals"] || []).length,
        detail: "SQLite database records"
      }
    ];

    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Institutional Reports</h2>
          <span className="healthy-tag">Summary</span>
        </div>

        <p>Summary of available institutional module records.</p>

        <DataTable records={reportItems} />

        <h3>Incident Report</h3>

        <p>
          Generate the detailed failure, impact, recovery and audit report.
        </p>

        <button
          className="primary-button"
          onClick={() => {
            setActivePage("Incident History");
            setIncidentReport(null);
          }}
        >
          Open Incident History Report
        </button>

        <p className="notice">
          This summary combines connected backend counts and demonstration
          records. It is not an official institutional report.
        </p>

        <button
          className="primary-button"
          onClick={() => window.print()}
        >
          Print / Save Summary as PDF
        </button>
      </section>
    );
  }

  /* SETTINGS */

  async function saveSettings() {
    setSettingsMessage("");

    try {
      await apiRequest(
        "/api/settings",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: {
              instituteName,
              notificationsEnabled,
              darkMode
            }
          })
        }
      );

      setSettingsMessage(
        "Settings saved successfully in the OMNIS-X database."
      );
    } catch (err) {
      setSettingsMessage(
        err instanceof Error ? err.message : "Unable to save settings."
      );
    }
  }

  function renderSettings() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>System Settings</h2>
          <span className="healthy-tag">Preferences</span>
        </div>

        <p>Manage the basic OMNIS-X interface preferences.</p>

        <label htmlFor="institute-name">Institution Name</label>

        <input
          id="institute-name"
          value={instituteName}
          onChange={(event) => setInstituteName(event.target.value)}
        />

        <div className="operation-row">
          <span>Enable Notifications</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) =>
              setNotificationsEnabled(event.target.checked)
            }
          />
        </div>

        <div className="operation-row">
          <span>Dark Mode Preference</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(event) => setDarkMode(event.target.checked)}
          />
        </div>

        <button
          className="primary-button"
          onClick={saveSettings}
        >
          Save Settings to Database
        </button>

        {settingsMessage && (
          <p className="notice">{settingsMessage}</p>
        )}

        <div className="notice">
          <p><strong>Application:</strong> OMNIS-X</p>
          <p><strong>Version:</strong> 1.0 Demo</p>
          <p><strong>Backend:</strong> {API}</p>
          <p><strong>Current Role:</strong> {role}</p>
        </div>

        <p className="notice">
          These are local interface preferences, not secure account or
          institutional administration settings.
        </p>
      </section>
    );
  }

  /* FAILURE DEMONSTRATION */

  function renderFailureDemo() {
    const failure = getRecord(simulationResult?.failure);
    const session = getRecord(simulationResult?.session);

    const impacts = getRecords(simulationResult?.direct_impacts);
    const cascading = getRecords(simulationResult?.cascading_impacts);
    const alternatives = getRecords(simulationResult?.alternative_resources);
    const recovery = getRecord(simulationResult?.recovery_plan);

    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>OMNIS-X Live Failure Simulation</h2>
          <span className="healthy-tag">Demo Engine</span>
        </div>

        <p>
          Detect an institutional failure and generate a recovery proposal.
        </p>

        <div className="notice">
          Demo scenario: Computer Lab 1 electricity failure during a CSE practical.
        </div>

        <button
          className="primary-button"
          onClick={runSimulation}
          disabled={simulationLoading}
        >
          {simulationLoading
            ? "Running Simulation..."
            : "Run Failure Simulation"}
        </button>

        {simulationError && (
          <p className="notice">{simulationError}</p>
        )}

        {simulationResult && (
          <>
            <section className="panel">
              <h3>1. Failure Detected</h3>
              <p>Failure: {formatValue(failure?.failure_type)}</p>
              <p>Resource: {formatValue(failure?.resource_name)}</p>
              <p>Description: {formatValue(failure?.description)}</p>
              <p>Status: {formatValue(simulationResult.incident_status)}</p>
            </section>

            <section className="panel">
              <h3>2. Affected Academic Session</h3>
              <p>Course: {formatValue(session?.course)}</p>
              <p>Department: {formatValue(session?.department)}</p>
              <p>Faculty: {formatValue(session?.faculty)}</p>
              <p>Students: {formatValue(session?.students)}</p>
              <p>
                Time: {formatValue(session?.start_time)} -
                {" "}{formatValue(session?.end_time)}
              </p>
              <p>
                Affected people: {formatValue(simulationResult.affected_people_count)}
              </p>
            </section>

            <section className="panel">
              <h3>3. Direct Impacts</h3>
              <DataTable records={impacts} />
            </section>

            <section className="panel">
              <h3>4. Cascading Impacts</h3>
              <DataTable records={cascading} />
            </section>

            <section className="panel">
              <h3>5. Alternative Resource Checks</h3>
              <DataTable records={alternatives} />
            </section>

            <section className="panel">
              <h3>6. Proposed Recovery Plan</h3>
              <p>
                Recommended action: {formatValue(recovery?.recommended_action)}
              </p>
              <p>Status: {formatValue(recovery?.status)}</p>
              <p>
                Approval required: {formatValue(recovery?.approval_required)}
              </p>
            </section>

            <section className="panel">
              <h3>7. Gemini AI Incident Analysis</h3>

              <button
                className="primary-button"
                onClick={generateAIExplanation}
                disabled={aiLoading}
              >
                {aiLoading
                  ? "Gemini AI is Analyzing..."
                  : aiExplanation
                    ? "Regenerate AI Explanation"
                    : "Generate AI Explanation"}
              </button>

              {aiError && <p className="notice">{aiError}</p>}

              {aiExplanation && (
                <div className="notice">
                  <h3>AI-Generated Explanation</h3>
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {aiExplanation}
                  </p>
                  <strong>Powered by Gemini AI</strong>
                </div>
              )}
            </section>

            {renderApprovalPanel()}

            <p className="notice">
              {formatValue(simulationResult.data_note)}
            </p>
          </>
        )}
      </section>
    );
  }

  /* DASHBOARD */

  function renderDashboard() {
    const statistics = [
      ["Total Students", data.students],
      ["Total Faculty", data.faculty],
      ["Departments", data.departments],
      ["Infrastructure", data.resources],
      ["Active Incidents", data.active_incidents]
    ];

    return (
      <>
        <section className="welcome-section">
          <div>
            <span className="eyebrow">
              INSTITUTIONAL INTELLIGENCE PLATFORM
            </span>
            <h1>Institutional Overview</h1>
            <p>
              Welcome to OMNIS-X — Intelligent Institutional Digital Twin.
            </p>
          </div>

          <span className="live-indicator">
            <span className="status-dot" />
            SYSTEM ONLINE
          </span>
        </section>

        <section className="stats-grid">
          {statistics.map(([label, value]) => (
            <div className="stat-card" key={String(label)}>
              <h3>{label}</h3>
              <h2>{value}</h2>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <h2>Institution Status</h2>
              <span className="healthy-tag">Connected</span>
            </div>

            <div className="operation-row">
              <span>Student Records</span>
              <strong>Connected</strong>
            </div>

            <div className="operation-row">
              <span>Faculty Records</span>
              <strong>Connected</strong>
            </div>

            <div className="operation-row">
              <span>Department Records</span>
              <strong>Connected</strong>
            </div>

            <div className="operation-row">
              <span>Active Incidents</span>
              <strong>{data.active_incidents}</strong>
            </div>

            <button
              className="primary-button"
              onClick={loadDashboard}
            >
              Refresh Dashboard
            </button>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Live Failure Demonstration</h2>
              <span className="healthy-tag">Ready</span>
            </div>

            <p>
              Test failure detection, impact analysis, alternative resources
              and recovery planning.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Live Failure Demo")}
            >
              Open Failure Demo
            </button>
          </div>
        </section>
      </>
    );
  }

  /* PAGE ROUTER */

  function renderPage() {
    if (activePage === "Dashboard") {
      return renderDashboard();
    }

    if (activePage === "Digital Twin") {
      return <CampusConnectivityMap />;
    }

    if (activePage === "Live Failure Demo") {
      return renderFailureDemo();
    }

    if (activePage === "Requests & Approvals") {
      return renderApprovalPanel();
    }

    if (activePage === "Incident History") {
      return renderIncidentReport();
    }

    if (activePage === "Reports") {
      return renderReports();
    }

    if (activePage === "Settings") {
      return renderSettings();
    }

    if (activePage === "Students") {
      return (
        <section className="panel">
          <div className="panel-heading">
            <h2>Student Management</h2>
            <span className="healthy-tag">{students.length} Records</span>
          </div>
          <DataTable records={students} />
        </section>
      );
    }

    if (activePage === "Faculty") {
      return (
        <section className="panel">
          <div className="panel-heading">
            <h2>Faculty Management</h2>
            <span className="healthy-tag">{faculty.length} Records</span>
          </div>
          <DataTable records={faculty} />
        </section>
      );
    }

    if (activePage === "Departments") {
      return (
        <section className="panel">
          <div className="panel-heading">
            <h2>Department Management</h2>
            <span className="healthy-tag">{departments.length} Records</span>
          </div>
          <DataTable records={departments} />
        </section>
      );
    }

    if (moduleFields[activePage]) {
      return (
        <ModuleWorkspace
          title={activePage}
          description={
            descriptions[activePage] || "Manage institutional records."
          }
          records={moduleData[activePage] || []}
          onAdd={(record) => addModuleRecord(activePage, record)}
          onDelete={(id) => {
            void deleteModuleRecord(activePage, id);
          }}
          onStatusChange={(id, status) => {
            void updateModuleStatus(activePage, id, status);
          }}
        />
      );
    }

    return (
      <section className="panel">
        <h2>{activePage}</h2>
        <p>Module not found.</p>
      </section>
    );
  }

  /* APPLICATION LAYOUT */

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <aside className="sidebar">
        <div className="brand">
          <h2>OMNIS-X</h2>
          <p>Institutional Intelligence</p>
        </div>

        <div className="institution">
          <strong>{instituteName}</strong>
          <span>Tiptur</span>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <nav>
          {menuItems.map((item, index) => (
            <button
              type="button"
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => {
                setActivePage(item);
                setError("");
                setModuleError("");
              }}
            >
              <span className="nav-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          System Connected
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <p className="breadcrumb">
            OMNIS-X / {activePage}
          </p>

          <div className="top-actions">
            <label htmlFor="role-select">Role:</label>

            <select
              id="role-select"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="profile-button"
            >
              <option>Main Admin</option>
              <option>Principal</option>
              <option>HOD</option>
              <option>Faculty</option>
              <option>Student</option>
            </select>
          </div>
        </header>

        <div className="page-content">
          {error && <p className="notice">{error}</p>}

          {moduleError && (
            <p className="notice">{moduleError}</p>
          )}

          {moduleLoading && moduleSlugs[activePage] && (
            <p className="notice">Loading saved records...</p>
          )}

          {renderPage()}
        </div>

        <footer>
          OMNIS-X | Intelligent Institutional Digital Twin
        </footer>
      </main>
    </div>
  );
}

export default App;