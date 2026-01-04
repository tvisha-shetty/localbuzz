import { useNavigate } from "react-router-dom";

function AddEvent() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h2>Add New Event</h2>

      <input placeholder="Title" style={inputStyle} />
      <input placeholder="Date & Time" style={inputStyle} />
      <input placeholder="Location" style={inputStyle} />
      <input placeholder="Image URL" style={inputStyle} />

      <button
        style={{
          marginTop: "16px",
          padding: "12px 20px",
          background: "#ff7a00",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Save Event (demo)
      </button>

      <br />

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "16px",
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

const inputStyle = {
  display: "block",
  width: "300px",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

export default AddEvent;
