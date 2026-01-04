import { useNavigate } from "react-router-dom";

function OrganizerDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h2>Organizer Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "24px" }}>
        <Stat label="Total Events" value="12" />
        <Stat label="Total Views" value="3,240" />
        <Stat label="Interested" value="186" />
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Your Events</h3>

        <div style={cardStyle}>
          <strong>Morning Yoga in the Park</strong>
          <p>⭐ 42 interested</p>
        </div>

        <div style={cardStyle}>
          <strong>Community Bhajan</strong>
          <p>⭐ 67 interested</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "30px",
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer"
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "10px",
        minWidth: "140px"
      }}
    >
      <h3 style={{ margin: 0, color: "#ff7a00" }}>{value}</h3>
      <p style={{ margin: 0, color: "#666" }}>{label}</p>
    </div>
  );
}

const cardStyle = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginBottom: "12px"
};

export default OrganizerDashboard;
