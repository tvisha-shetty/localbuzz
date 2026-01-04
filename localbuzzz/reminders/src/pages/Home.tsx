import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>LocalBuzz</h1>
      <p>Discover hyper-local activities around you.</p>

      <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
        <button
          onClick={() => navigate("/add-event")}
          style={{
            padding: "12px 20px",
            background: "#ff7a00",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Add Activity
        </button>

        <button
          onClick={() => navigate("/organizer")}
          style={{
            padding: "12px 20px",
            background: "#fff",
            color: "#ff7a00",
            border: "2px solid #ff7a00",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Organizer Dashboard
        </button>
      </div>
    </div>
  );
}

export default Home;
