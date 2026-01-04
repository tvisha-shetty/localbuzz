import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

// 🎯 DATA POOLS
const titles = [
  "Morning Yoga",
  "Ganesh Puja",
  "Book Club Meetup",
  "5K Run",
  "Cycling Group Ride",
  "Community Music Night",
  "Temple Aarti",
  "Startup Meetup",
  "College Fest",
  "Navratri Garba",
  "Diwali Celebration",
  "Sunday Brunch Meetup"
];

const categories = [
  "Religious",
  "Fitness",
  "Education",
  "Cultural",
  "Social"
];

// 📐 Generate random point within radius (km)
function randomLocationWithinRadius(
  baseLat: number,
  baseLng: number,
  radiusKm: number
) {
  const radiusInDegrees = radiusKm / 111; // approx conversion
  const u = Math.random();
  const v = Math.random();

  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;

  const latOffset = w * Math.cos(t);
  const lngOffset = w * Math.sin(t);

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
}

// 📅 Random future date
function randomDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 15));
  return d.toISOString().split("T")[0];
}

function SeedEvents() {
  const seed = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const baseLat = pos.coords.latitude;
      const baseLng = pos.coords.longitude;

      const TOTAL_EVENTS = 20;

      for (let i = 0; i < TOTAL_EVENTS; i++) {
        let locationPoint;

        // 🎯 DISTRIBUTION
        if (i < 8) {
          // within 0–5 km
          locationPoint = randomLocationWithinRadius(baseLat, baseLng, 5);
        } else if (i < 14) {
          // within 5–10 km
          locationPoint = randomLocationWithinRadius(baseLat, baseLng, 10);
        } else {
          // far away (15–25 km)
          locationPoint = randomLocationWithinRadius(baseLat, baseLng, 25);
        }

        await addDoc(collection(db, "events"), {
          title: titles[Math.floor(Math.random() * titles.length)],
          date: randomDate(),
          location: "Auto Generated Location",
          category: categories[Math.floor(Math.random() * categories.length)],
          lat: locationPoint.lat,
          lng: locationPoint.lng,
          stats: {
            saves: 0,
            attends: 0
          }
        });
      }

      alert("✅ 20 location-aware events added!");
    });
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={seed}>
        ➕ Add Nearby Demo Events (5km / 10km)
      </button>
    </div>
  );
}

export default SeedEvents;
