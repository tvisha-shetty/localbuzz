import { motion } from "framer-motion";

export default function AceternityHero({
  onCustomer,
  onOrganizer,
}: {
  onCustomer: () => void;
  onOrganizer: () => void;
}) {
  return (
    <section
      style={{
        minHeight: "90vh",
        background:
          "radial-gradient(circle at top, #fff3e6 0%, #ffd8b0 40%, #ffeede 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "1100px", textAlign: "center", padding: "40px" }}>
        {/* 🔥 HEADING */}
        <h1 style={{ fontSize: "56px", fontWeight: 800, marginBottom: "20px" }}>
          {"Discover everything happening near you"
            .split(" ")
            .map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ marginRight: 8, display: "inline-block" }}
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* 🔥 DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.4,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            fontSize: "18px",
            color: "#555",
            marginBottom: "40px",
          }}
        >
          From society pujas to running groups, temple jagratas to book clubs —
          never miss what’s happening around you.
        </motion.p>

        {/* 🔥 CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        >
          <button
            onClick={onCustomer}
            style={{
              padding: "14px 28px",
              background: "#ff7a00",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Explore Activities →
          </button>

          <button
            onClick={onOrganizer}
            style={{
              padding: "14px 28px",
              background: "#fff",
              border: "2px solid #ff7a00",
              color: "#ff7a00",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            I’m an Organizer
          </button>
        </motion.div>
      </div>
    </section>
  );
}
