// Updated 2026-01-05 01:06
import emailjs from "emailjs-com";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useState, useRef, useEffect } from "react";



// 🔐 STRIPE PAYMENT LINKS (TEST MODE)
const STRIPE_CUSTOMER_URL = "https://buy.stripe.com/test_5kQ3cw9dmenp6F3eQrdnW00";
const STRIPE_ORGANIZER_URL = "https://buy.stripe.com/test_6oU9AUdtCfrt4wV0ZBdnW01";

emailjs.init("ieRqsJaLCeqScpn6x");

const StatCard = ({ label, value, icon, trend }: { label: string; value: number; icon?: string; trend?: string }) => (
 <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
    {icon && <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>}
    <div style={{ fontSize: "32px", fontWeight: "700", color: "#ff7a00", marginBottom: "4px" }}>{value}</div>
    <div style={{ fontSize: "14px", color: "#666" }}>{label}</div>
    {trend && (
      <div style={{ marginTop: "8px", fontSize: "13px", color: "#10b981", fontWeight: "500" }}>{trend}</div>
    )}
  </div>
);

function App() {
  // ================= AI SEARCH =================



// ================= AI DESCRIPTION =================
// ================= AI DESCRIPTION =================
const generateDescription = async () => {
  const titleInput = document.getElementById("title") as HTMLInputElement;
  const categoryInput = document.getElementById("category") as HTMLSelectElement;
  const locationInput = document.getElementById("location") as HTMLInputElement;
  const dateInput = document.getElementById("date") as HTMLInputElement;

  const title = titleInput?.value;
  const category = categoryInput?.value;
  const location = locationInput?.value;
  const date = dateInput?.value;

  if (!title || !category || !location) {
    alert("Please fill in Title, Category, and Location first!");
    return;
  }

  setIsGeneratingDescription(true);

  try {
    const res = await fetch(
  `${import.meta.env.VITE_AI_SERVER_URL}/api/generate-description`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      category,
      location,
      date
    })
  }
);

if (!res.ok) {
  throw new Error("AI server error");
}

const data = await res.json();
setEventDescription(data.text);

 } catch (error) {
  console.error("Description error:", error);
  alert("Failed to generate description. AI server is not responding.");
}
 finally {
    setIsGeneratingDescription(false);
  }
};

  const homeRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);
  const [fakeUser, setFakeUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"customer" | "organizer" | null>(null);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const editedEventRef = useRef<any>(null);
  const [screen, setScreen] = useState<"landing" | "home" | "add" | "dashboard" | "pricing">("landing");
  const [showPricing, setShowPricing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"customer" | "organizer" | null>(null);
  const pricingCardsRef = useRef<HTMLDivElement>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [selectedRole, setSelectedRole] = useState<"customer" | "organizer">("customer");
  const newlyAddedEventRef = useRef<HTMLDivElement>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
// AI FEATURE STATES
const [aiSearchQuery, setAiSearchQuery] = useState("");
const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
const [eventDescription, setEventDescription] = useState("");
const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
const [viewingEventDetail, setViewingEventDetail] = useState<number | null>(null);



  /* USER LOCATION */
  const userLocation = { lat: 12.9716, lng: 77.5946 };

  function calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) * 111;
  }

  const [distanceFilter, setDistanceFilter] = useState("ALL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [postAuthTarget, setPostAuthTarget] = useState<
  "home" | "dashboard" | "pricing" | null
>(null);





  const handleStripePayment = (role: "customer" | "organizer") => {
    localStorage.setItem("pendingRole", role);
    window.location.href = role === "customer" ? STRIPE_CUSTOMER_URL : STRIPE_ORGANIZER_URL;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      const role = localStorage.getItem("pendingRole") as
        | "customer"
        | "organizer"
        | null;
      setScreen("landing");
      if (role) {
        setSelectedRole(role);
        setAuthMode("signup");
        setShowPaymentSuccess(true);
        localStorage.removeItem("pendingRole");
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (screen === "home" && userRole === "organizer") {
      setScreen("dashboard");
    }
  }, [screen, userRole]);

  useEffect(() => {
  if (fakeUser && userRole === "organizer" && screen === "home") {
    setScreen("dashboard");
  }
}, [fakeUser, userRole, screen]);


  const handleAuth = async (mode: "signin" | "signup") => {
    try {
      let userCred;
      if (mode === "signin") {
        userCred = await signInWithEmailAndPassword(auth, email, password);
        let role: "customer" | "organizer";
        if (screen === "landing") {
          role = selectedRole;
        } else {
          const storedRole = localStorage.getItem(`role_${userCred.user.email}`);
          role = storedRole ? (storedRole as "customer" | "organizer") : "customer";
        }
        localStorage.setItem(`role_${userCred.user.email}`, role);
        setUserRole(role);
        setFakeUser(userCred.user.email);
        setShowAuthModal(false);
       const target = postAuthTarget ?? (role === "organizer" ? "dashboard" : "home");
setScreen(target);
setPostAuthTarget(null);

      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem(`role_${userCred.user.email}`, selectedRole);
        setUserRole(selectedRole);
        setFakeUser(userCred.user.email);
        setShowAuthModal(false);
        if (selectedRole === "organizer") {
  setScreen("dashboard");
} else {
  setScreen("home");
}

      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      let role: "customer" | "organizer";
      if (screen === "landing") {
        role = selectedRole;
      } else {
        const storedRole = localStorage.getItem(`role_${result.user.email}`);
        role = storedRole ? (storedRole as "customer" | "organizer") : selectedRole;
      }
      localStorage.setItem(`role_${result.user.email}`, role);
      setFakeUser(result.user.email);
      setUserRole(role);
      setShowAuthModal(false);
      setScreen(role === "organizer" ? "dashboard" : "home");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setFakeUser(null);
    setUserRole(null);
    setScreen("landing");
  };

 const ANALYTICS = {
  totalEvents: 150,
  totalViews: 3381,
  totalClicks: 1764,
  totalInterested: 191,
  engagementRate: 52.2,
  avgViewsPerEvent: 225,
  avgClicksPerEvent: 118,
  avgInterestPerEvent: 19,
  topEvents: [
    { title: "Morning Yoga in the Park", category: "Fitness", date: "Sunday • 7:00 AM", views: 856, clicks: 389, interested: 45 },
    { title: "Temple Bhajan Morning", category: "Religious", date: "Friday • 6:00 AM", views: 1289, clicks: 678, interested: 67 },
    { title: "Live Indie Music Concert", category: "Music", date: "Saturday • 8:00 PM", views: 412, clicks: 298, interested: 34 }
  ],
  categoryBreakdown: [
    { name: "Fitness", count: 4 },
    { name: "Religious", count: 2 },
    { name: "Social", count: 3 },
    { name: "Music", count: 2 },
    { name: "Creative", count: 2 },
    { name: "Outdoor", count: 1 }
  ]
};

  const HARD_CODED_EVENT_STATS = { views: 1240, clicks: 486, interested: 92, ctr: "39.2%" };

  //const hardcodedAttendees = [
    //{ name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+91-9876543210", registeredDate: "Dec 18, 2025" },
    //{ name: "Rahul Verma", email: "rahul.v@email.com", phone: "+91-9876543211", registeredDate: "Dec 19, 2025" },
 //   { name: "Ananya Patel", email: "ananya.p@email.com", phone: "+91-9876543212", registeredDate: "Dec 20, 2025" },
   // { name: "Arjun Reddy", email: "arjun.reddy@email.com", phone: "+91-9876543213", registeredDate: "Dec 18, 2025" },
   // { name: "Sneha Iyer", email: "sneha.iyer@email.com", phone: "+91-9876543214", registeredDate: "Dec 21, 2025" },
   // { name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91-9876543215", registeredDate: "Dec 19, 2025" },
   // { name: "Divya Krishna", email: "divya.k@email.com", phone: "+91-9876543216", registeredDate: "Dec 20, 2025" },
    //{ name: "Karthik Menon", email: "karthik.m@email.com", phone: "+91-9876543217", registeredDate: "Dec 21, 2025" },
  //  { name: "Meera Desai", email: "meera.d@email.com", phone: "+91-9876543218", registeredDate: "Dec 18, 2025" },
   // { name: "Aditya Nair", email: "aditya.n@email.com", phone: "+91-9876543219", registeredDate: "Dec 19, 2025" }
  //];

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved ? JSON.parse(saved) : [
      { title: "Morning Yoga in the Park", date: "Sunday • 7:00 AM", location: "Cubbon Park, Bengaluru", image: "https://thumbs.dreamstime.com/b/side-view-shot-indian-young-couple-doing-yoga-meditation-park-morning-concept-mindfulness-training-tranquility-275152266.jpg", lat: 12.9763, lng: 77.5929, saved: 0, attending: 45, category: "Fitness", views: 856, clicks: 389, status: "published", attendees: [{ name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+91-9876543210", registeredDate: "Dec 18, 2025" }, { name: "Rahul Verma", email: "rahul.v@email.com", phone: "+91-9876543211", registeredDate: "Dec 19, 2025" }, { name: "Ananya Patel", email: "ananya.p@email.com", phone: "+91-9876543212", registeredDate: "Dec 20, 2025" }] },
      { title: "Sunrise Yoga Flow", date: "Saturday • 6:30 AM", location: "Lalbagh Botanical Garden", image: "https://media.gettyimages.com/id/1130226937/video/4k-man-in-meditation-yoga-position-on-the-top-of-mountain-at-sunrise.jpg?s=640x640&k=20&c=ibttXQDcW6ahDhhmHJ4QK35UxMnGLjoMfbQVN8VkfP4=", lat: 12.9507, lng: 77.5848, saved: 0, attending: 32, category: "Fitness", views: 703, clicks: 412, status: "published", attendees: [{ name: "Arjun Reddy", email: "arjun.reddy@email.com", phone: "+91-9876543213", registeredDate: "Dec 18, 2025" }, { name: "Sneha Iyer", email: "sneha.iyer@email.com", phone: "+91-9876543214", registeredDate: "Dec 21, 2025" }] },
      { title: "Community Yoga Session", date: "Sunday • 8:00 AM", location: "JP Nagar", image: "https://www.shutterstock.com/image-photo/beawar-india-june-18-2024-260nw-2489473741.jpg", lat: 12.9077, lng: 77.5855, saved: 0, attending: 28, category: "Fitness", views: 534, clicks: 267, status: "published", attendees: [{ name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91-9876543215", registeredDate: "Dec 19, 2025" }] },
      { title: "Temple Bhajan Morning", date: "Friday • 6:00 AM", location: "ISKCON Temple", image: "https://www.shutterstock.com/image-photo/vrindavan-india-september-01-2022-600nw-2468753621.jpg", lat: 13.0098, lng: 77.5511, saved: 0, attending: 67, category: "Religious", views: 1289, clicks: 678, status: "published", attendees: [{ name: "Divya Krishna", email: "divya.k@email.com", phone: "+91-9876543216", registeredDate: "Dec 20, 2025" }, { name: "Karthik Menon", email: "karthik.m@email.com", phone: "+91-9876543217", registeredDate: "Dec 21, 2025" }, { name: "Meera Desai", email: "meera.d@email.com", phone: "+91-9876543218", registeredDate: "Dec 18, 2025" }] },
      { title: "Weekend Book Club Meetup", date: "Sunday • 5:00 PM", location: "Indiranagar", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", lat: 12.9719, lng: 77.6412, saved: 0, attending: 19, category: "Social", views: 476, clicks: 198, status: "published", attendees: [{ name: "Aditya Nair", email: "aditya.n@email.com", phone: "+91-9876543219", registeredDate: "Dec 19, 2025" }] },
      { title: "Evening Meditation", date: "Daily • 7:00 PM", location: "Whitefield", image: "https://www.indianpanorama.in/assets/images/tourpackages/banner/yoga-and-meditation-in-india.webp", lat: 12.9698, lng: 77.75, saved: 0, attending: 0, category: "Wellness", views: 198, clicks: 123, status: "published", attendees: [] },
      { title: "Group Running Session", date: "Saturday • 6:00 AM", location: "Cubbon Park", image: "https://images.mid-day.com/images/images/2025/jan/Running-1_d.jpg", lat: 12.9763, lng: 77.5929, saved: 0, attending: 0, category: "Fitness", views: 221, clicks: 145, status: "published", attendees: [] },
      { title: "Cycling Community Ride", date: "Sunday • 5:30 AM", location: "MG Road", image: "https://imgmediagumlet.lbb.in/media/2019/12/5df37c3e0cc36fedc3638ce8_1576238142805.jpg", lat: 12.9758, lng: 77.606, saved: 0, attending: 0, category: "Fitness", views: 187, clicks: 102, status: "published", attendees: [] },
      { title: "Art & Sketch Meetup", date: "Saturday • 4:00 PM", location: "Koramangala", image: "https://miro.medium.com/v2/resize:fit:1400/0*WLxBMDp2tc_nE6MO.jpg", lat: 12.9352, lng: 77.6245, saved: 0, attending: 0, category: "Creative", views: 143, clicks: 79, status: "published", attendees: [] },
      { title: "Local Music Jam", date: "Friday • 8:00 PM", location: "HSR Layout", image: "https://sc0.blr1.cdn.digitaloceanspaces.com/article/109199-wnqjmgchxu-1546001065.jpg", lat: 12.9116, lng: 77.6474, saved: 0, attending: 0, category: "Music", views: 267, clicks: 189, status: "published", attendees: [] },
      { title: "Women's Fitness Bootcamp", date: "Monday • 6:00 AM", location: "BTM Layout", image: "https://t4.ftcdn.net/jpg/08/61/69/45/360_F_861694590_3jqiyNFhOfL3LVpgmLQ7GmiNq6esOu6T.jpg", lat: 12.9166, lng: 77.6101, saved: 0, attending: 0, category: "Fitness", views: 234, clicks: 156, status: "published", attendees: [] },
      { title: "Sunday Nature Walk", date: "Sunday • 7:30 AM", location: "Bannerghatta", image: "https://media.istockphoto.com/id/1439943931/photo/family-with-backpacks-hiking-or-walking-through-woodland-countryside.jpg?s=612x612&w=0&k=20&c=zFWhWgXUC7XqtkJLg8-avUn17asGXw9MbS0uqYnJk94=", lat: 12.8, lng: 77.577, saved: 0, attending: 0, category: "Outdoor", views: 198, clicks: 134, status: "published", attendees: [] },
      { title: "Live Indie Music Concert", date: "Saturday • 8:00 PM", location: "Indiranagar", image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2", lat: 12.9719, lng: 77.6412, saved: 0, attending: 0, category: "Music", views: 412, clicks: 298, status: "published", attendees: [] },
      { title: "Weekend Photography Workshop", date: "Sunday • 10:00 AM", location: "Koramangala", image: "https://toddandbradreed.com/resources/image/19/workshop-images/picture-perfect/two.jpg", lat: 12.9352, lng: 77.6245, saved: 0, attending: 0, category: "Creative", views: 176, clicks: 98, status: "published", attendees: [] },
      { title: "College Cultural Fest", date: "Friday • 4:00 PM", location: "RV College of Engineering", image: "https://www.gngroup.org/Upload/News/12542025115430284dfc0162f-68f5-43e1-b9eb-2ea103577092WhatsApp%20Image%202025-04-11%20at%206.45.33%20PM.jpeg", lat: 12.9237, lng: 77.4987, saved: 0, attending: 0, category: "Cultural", views: 523, clicks: 387, status: "published", attendees: [] },
      { title: "Society Party Night", date: "Saturday • 7:30 PM", location: "Whitefield Society Clubhouse", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", lat: 12.9698, lng: 77.75, saved: 0, attending: 0, category: "Social", views: 298, clicks: 201, status: "published", attendees: [] },
      { title: "Birthday Celebration Meetup", date: "Sunday • 6:00 PM", location: "HSR Layout", image: "https://images.pexels.com/photos/30682922/pexels-photo-30682922/free-photo-of-joyful-indoor-birthday-celebration-with-friends.jpeg", lat: 12.9116, lng: 77.6474, saved: 0, attending: 0, category: "Social", views: 167, clicks: 112, status: "published", attendees: [] },
      { title: "Community Dinner Gathering", date: "Friday • 8:00 PM", location: "BTM Layout Community Hall", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe", lat: 12.9166, lng: 77.6101, saved: 0, attending: 0, category: "Social", views: 189, clicks: 134, status: "published", attendees: [] }
    ];
  });



  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const organizerEvents = fakeUser ? events.filter(e => !e.owner || e.owner === fakeUser) : [];
  const totalAttending = organizerEvents.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);

  const incrementAttending = (index: number) => {
    setEvents(prev => prev.map((e, _i) => {
      if (i !== index) return e;
      const currentCount = e.attendees?.length || 0;
      const nextGuestNumber = currentCount + 1;
      return {
        ...e,
        attending: e.attending + 1,
        attendees: [
          ...(e.attendees || []),
          { name: `Guest User ${nextGuestNumber}`, email: `guest${nextGuestNumber}@email.com`, phone: "Not provided", registeredDate: new Date().toDateString() }
        ]
      };
    }));
  };

  const enrichedEvents = events
    .map(e => ({ ...e, distance: calculateDistanceKm(userLocation.lat, userLocation.lng, e.lat, e.lng) }))
    .filter(e => {
      if (distanceFilter === "5") return e.distance <= 5;
      if (distanceFilter === "10") return e.distance <= 10;
      return true;
    });

  const emailAllAttendees = async () => {
    const email = prompt("Enter your email to receive the attendee summary");
    if (!email) return;
    const eventList = organizerEvents.map(e => `• ${e.title} (${e.attending} interested)`).join("\n");
    try {
      await emailjs.send("service_r88bii1", "template_yll8o03", {
        to_email: email,
        from_name: "LocalBuzz",
        subject: "Your Event Attendee Summary",
        message: `Hello,\n\nHere is a quick summary of interest across your events:\n\n${eventList}\n\nTotal interested users: ${totalAttending}\n\nYou can log in to your Organizer Dashboard for detailed analytics.\n\n– LocalBuzz Team`
      }, "ieRqsJaLCeqScpn6x");
      alert("Attendee summary email sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  };

  const exportOrganizerData = () => {
    const headers = ["Title", "Date", "Location", "Category", "Views", "Clicks", "Interested"];
    const rows = organizerEvents.map(e => [e.title, e.date, e.location, e.category, e.views, e.clicks, e.attending]);
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "organizer_events.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const AuthModal = () => (
    <div onClick={() => setShowAuthModal(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div onClick={e => e.stopPropagation()} className="auth-modal-glow" style={{ background: "#fff", padding: "32px", borderRadius: "20px", width: "90%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative" }}>
        <div className="glow-border"></div>
        <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "700", textAlign: "center" }}>{authMode === "signin" ? "Welcome Back!" : "Join LocalBuzz"}</h2>
        {authMode === "signup" && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>I am a:</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setSelectedRole("customer")} className="btn-animate" style={{ flex: 1, padding: "12px", border: selectedRole === "customer" ? "2px solid #ff7a00" : "1px solid #ddd", background: selectedRole === "customer" ? "#fff7ed" : "#fff", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: selectedRole === "customer" ? "600" : "400" }}>Customer</button>
              <button onClick={() => setSelectedRole("organizer")} className="btn-animate" style={{ flex: 1, padding: "12px", border: selectedRole === "organizer" ? "2px solid #ff7a00" : "1px solid #ddd", background: selectedRole === "organizer" ? "#fff7ed" : "#fff", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: selectedRole === "organizer" ? "600" : "400" }}>Organizer</button>
            </div>
          </div>
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" }} />
        <button onClick={() => handleAuth(authMode)} className="btn-animate" style={{ width: "100%", padding: "12px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer", fontWeight: "600", marginBottom: "12px" }}>{authMode === "signin" ? "Sign In" : "Create Account"}</button>
        <button onClick={handleGoogleAuth} className="btn-animate" style={{ width: "100%", padding: "12px", background: "#fff", color: "#333", border: "1px solid #ccc", borderRadius: "10px", fontSize: "15px", cursor: "pointer", fontWeight: "600", marginBottom: "16px" }}>Continue with Google</button>
        <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
          {authMode === "signin" ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")} style={{ color: "#ff7a00", cursor: "pointer", marginLeft: "4px", fontWeight: "600" }}>{authMode === "signin" ? "Sign Up" : "Sign In"}</span>
        </div>
        <button onClick={() => setShowAuthModal(false)} style={{ background: "none", border: "none", color: "#666", fontSize: "14px", cursor: "pointer", width: "100%", marginTop: "12px" }}>Close</button>
      </div>
    </div>
  );

  if (screen === "landing") {
     
    return (
      <div style={{ minHeight: "100vh", background: "#fff", position: "relative", overflow: "hidden" }}>
      
        
        {/* HEADER */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 100, borderBottom: "1px solid rgba(255,122,0,0.1)" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>LocalBuzz</div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div onClick={() => { setSelectedRole("customer"); setAuthMode("signup"); setShowAuthModal(true); }} style={{ cursor: "pointer", fontSize: "14px", color: "#e65100", fontWeight: 500 }}>Get Started</div>
            <div onClick={() => { setScreen("pricing"); setTimeout(() => { pricingCardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} style={{ cursor: "pointer", fontSize: "14px", color: "#ff7a00", fontWeight: 600 }}>Pricing</div>
          </div>
        </div>

        {/* HERO SECTION WITH 3D SCROLL */}
        <div 
          className="container-scroll-animation"
          style={{ 
            padding: "120px 40px", 
            textAlign: "center", 
            maxWidth: "1200px", 
            margin: "0 auto",
            transition: "transform 0.1s ease-out"
          }}
        >
          <div style={{ display: "inline-block", padding: "8px 20px", background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", borderRadius: "999px", fontSize: "14px", fontWeight: "600", color: "#ea580c", marginBottom: "24px", border: "1px solid rgba(255,122,0,0.2)" }}>
            Discover what's happening in your neighborhood
          </div>
          <h1 style={{ fontSize: "64px", fontWeight: "800", marginBottom: "24px", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 50%, #dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.2" }}>
            Your Local Activity<br />Intelligence Platform
          </h1>
          <p style={{ fontSize: "20px", color: "#666", marginBottom: "40px", maxWidth: "700px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            From society pujas to running groups, from temple jagratas to book clubs — discover everything happening around you, even the events that never make it online.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { if (fakeUser) { setScreen("home"); } else { setSelectedRole("customer"); setAuthMode("signup"); setShowAuthModal(true); } }} className="btn-animate glow-button" style={{ padding: "14px 28px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>Explore Activities →</button>
           <button
  onClick={() => { 
    setSelectedRole("organizer"); 
    setAuthMode("signup"); 
    setShowAuthModal(true);
  }}
  className="btn-animate"
  style={{
    padding: "14px 28px",
    background: "#ffffff",
    color: "#ff7a00",
    border: "2px solid #ff7a00",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: 600
  }}
>
  I'm an Organizer
</button>

          </div>
        </div>

        {/* STATS SECTION - BENTO GRID */}
        <div style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            <StatCard label="Local Activities" value={10000} trend="+25%" />
            <StatCard label="Communities" value={500} trend="+12%" />
            <StatCard label="Cities" value={50} trend="Growing" />
            <StatCard label="User Satisfaction" value={98} trend="Top Rated" />
          </div>
        </div>

        {/* THREE LAYERS SECTION - BENTO CARDS */}
        <div style={{ padding: "80px 40px", background: "rgba(255,247,237,0.5)", position: "relative" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "48px", fontWeight: "800", textAlign: "center", marginBottom: "16px", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Three Layers of Local Life</h2>
            <p style={{ fontSize: "18px", color: "#666", textAlign: "center", marginBottom: "60px", maxWidth: "700px", margin: "0 auto 60px" }}>We capture activities that other platforms miss — from formal events to informal community gatherings</p>
            
            <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
              {/* FORMAL EVENTS CARD */}
              <div className="bento-card layer-card" style={{ background: "rgba(255, 255, 255, 0.95)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Formal Events</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Concerts, workshops, college fests and ticketed shows</p>
                <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500" alt="Events" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Concerts", "Workshops", "College Fests", "Shows"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(255,122,0,0.1)", color: "#ea580c", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(255,122,0,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* COMMUNITY ACTIVITIES CARD */}
              <div className="bento-card layer-card" style={{ background: "rgba(255, 255, 255, 0.95)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Community Activities</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Religious gatherings, fitness groups, cultural meetups</p>
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500" alt="Community" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Temple Programs", "Running Groups", "Book Clubs", "NGO Drives"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(234,88,12,0.1)", color: "#c2410c", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(234,88,12,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* LOCAL GATHERINGS CARD */}
              <div className="bento-card layer-card" style={{ background: "rgba(255, 255, 255, 0.95)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Local Gatherings</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Society parties, celebrations, and informal meetups</p>
                <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500" alt="Gatherings" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Society Parties", "Birthday Celebrations", "Community Dinners"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(220,38,38,0.1)", color: "#991b1b", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(220,38,38,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div style={{ padding: "120px 40px", textAlign: "center", background: "linear-gradient(180deg, rgba(255,247,237,0) 0%, rgba(255,247,237,0.8) 100%)" }}>
          <h2 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(135deg, #ff7a00 0%, #dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ready to discover your local community?</h2>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>Join thousands of users who never miss what's happening in their neighborhood. From religious gatherings to fitness groups — find it all on Local Buzz.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
           <button 
  onClick={() => { 
    if (fakeUser) { 
      setScreen("home"); 
    } else { 
      setSelectedRole("customer"); 
      setAuthMode("signup"); 
      setShowAuthModal(true); 
    } 
  }} 
  className="btn-animate glow-button" 
  style={{ padding: "14px 28px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}
>
  Start Exploring
</button>
            <button onClick={() => {
  setSelectedRole("organizer");
  setAuthMode("signup");
  setShowAuthModal(true);
}}
 className="btn-animate" style={{ padding: "14px 28px", background: "#ffffff", color: "#ff7a00", border: "2px solid #ff7a00", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: 600 }}>I'm an Organizer</button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", color: "#fff", padding: "60px 40px 30px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#ff7a00" }}>LocalBuzz</div>
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>Discover hyper-local activities in your neighborhood. From formal events to community gatherings — never miss what's happening near you.</p>
            </div>
            <div><div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Discover</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["All Activities", "Events & Concerts", "Community Activities", "Local Gatherings"].map(item => (<li key={item} style={{ marginBottom: "8px" }}><span onClick={() => { setSelectedRole("customer"); setAuthMode("signup"); setShowAuthModal(true); }} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>{item}</span></li>))}
              </ul>
            </div>
            <div><div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>For Organizers</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "8px" }}><span onClick={() => { setSelectedRole("organizer"); setAuthMode("signup"); setShowAuthModal(true); }} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Organizer Dashboard</span></li>
                <li style={{ marginBottom: "8px" }}><span onClick={() => { setSelectedRole("organizer"); setAuthMode("signup"); setShowAuthModal(true); }} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Submit Activity</span></li>
                <li style={{ marginBottom: "8px" }}><span onClick={() => setScreen("pricing")} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Pricing</span></li>
              </ul>
            </div>
            <div><div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Company</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map(item => (<li key={item} style={{ marginBottom: "8px" }}><span style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>{item}</span></li>))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px", textAlign: "center", fontSize: "14px", color: "#9ca3af" }}>© 2025 LocalBuzz. All rights reserved. Made with love for local communities</div>
        </div>

        {showAuthModal && <AuthModal />}
        {showPaymentSuccess && (
          <div onClick={() => { setShowPaymentSuccess(false); setShowAuthModal(true); }} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
            <div onClick={e => e.stopPropagation()} className="success-modal-glow" style={{ background: "#fff", padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "400px", boxShadow: "0 25px 70px rgba(0,0,0,0.4)", position: "relative" }}>
              <div className="glow-border"></div>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "40px", fontWeight: "800" }}>✓</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>Payment Successful</h3>
              <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>Your {selectedRole === "organizer" ? "Organizer" : "Customer"} plan is active. Create your account to continue.</p>
              <button onClick={() => { setShowPaymentSuccess(false); setShowAuthModal(true); }} className="btn-animate" style={{ padding: "12px 32px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>Continue</button>
            </div>
          </div>
        )}

        {/* CSS ANIMATIONS */}
        <style>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-5%) translateY(-5%); }
            50% { transform: translateX(-10%) translateY(5%); }
            75% { transform: translateX(-5%) translateY(-5%); }
          }

          .wavy-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(135deg, 
              rgba(255,122,0,0.05) 0%,
              rgba(251,191,36,0.05) 25%,
              rgba(234,88,12,0.05) 50%,
              rgba(220,38,38,0.05) 75%,
              rgba(255,122,0,0.05) 100%
            );
            animation: wave 20s ease-in-out infinite;
            z-index: 0;
            opacity: 0.6;
          }

          .wavy-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, rgba(255,122,0,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(234,88,12,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(251,191,36,0.1) 0%, transparent 50%);
            animation: wave 15s ease-in-out infinite reverse;
          }

          .container-scroll-animation {
            transform-style: preserve-3d;
          }

          .glow-border {
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #ff7a00, #fbbf24, #ea580c, #dc2626);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(8px);
          }

          .stat-card-glow:hover .glow-border,
          .auth-modal-glow .glow-border,
          .success-modal-glow .glow-border,
          .bento-card:hover .glow-border,
          .activity-card-glow:hover .glow-border,
          .pricing-card-glow:hover .glow-border {
            opacity: 0.6;
          }

          .bento-card {
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .bento-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(255,122,0,0.2);
          }

          .layer-card {
            background-clip: padding-box;
          }

          .tag-glow {
            position: relative;
            transition: all 0.3s ease;
          }

          .tag-glow:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(255,122,0,0.3);
          }

          .glow-button {
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(255,122,0,0.4);
          }

          .glow-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }

          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }

          .btn-animate {
            transition: all 0.3s ease;
          }

          .btn-animate:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }

          .btn-animate:active {
            transform: translateY(0);
          }
        `}</style>
      </div>
    );
  }

  // [REMAINING SCREENS: ADD, DASHBOARD, HOME, PRICING - keeping the same structure but adding glow effects to cards]
  // Due to length, I'll show the pattern for cards that should have glow effects:

  if (screen === "add") {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", position: "relative" }}>
        <div className="wavy-background"></div>
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: "1px solid #e5e7eb", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>LocalBuzz</div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div onClick={() => setScreen("dashboard")} style={{ cursor: "pointer", fontSize: "14px", color: "#484f59ff" }}>← Back to Dashboard</div>
            <div onClick={handleLogout} style={{ cursor: "pointer", fontSize: "14px", color: "#e65100", fontWeight: 500 }}>Logout</div>
          </div>
        </div>
        <div style={{ padding: "60px 40px", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="bento-card" style={{ background: "#fff", padding: "40px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative" }}>
            <div className="glow-border"></div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "12px", color: "#1f2937" }}>{editingEvent !== null ? "Edit Activity" : "Add a New Activity"}</h2>
            <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>Share a local event with your community. Fill in the details below.</p>
            {[
              { id: "title", placeholder: "Event Title" },
              { id: "date", placeholder: "Date & Time (e.g., Sunday • 7:00 AM)" },
              { id: "location", placeholder: "Location" },
              { id: "image", placeholder: "Image URL" },
              { id: "lat", placeholder: "Latitude" },
              { id: "lng", placeholder: "Longitude" }
            ].map(field => (
              <input key={field.id} id={field.id} type="text" placeholder={field.placeholder} defaultValue={editingEvent !== null ? (events[editingEvent] as any)[field.id] : ""} style={{ width: "100%", padding: "14px", marginBottom: "16px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box", transition: "border 0.2s ease" }} onFocus={e => e.target.style.border = "2px solid #ff7a00"} onBlur={e => e.target.style.border = "1px solid #d1d5db"} />
            ))}
            <select id="category" defaultValue={editingEvent !== null ? events[editingEvent].category : ""} style={{ width: "100%", padding: "14px", marginBottom: "24px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box", transition: "border 0.2s ease" }} onFocus={e => e.target.style.border = "2px solid #ff7a00"} onBlur={e => e.target.style.border = "1px solid #d1d5db"}>
              <option value="">Select Category</option>
              {["Fitness", "Religious", "Social", "Wellness", "Music", "Creative", "Outdoor", "Cultural"].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            {/* AI DESCRIPTION GENERATOR */}
<div style={{ marginBottom: "24px" }}>
  <label style={{ 
    fontSize: "14px", 
    fontWeight: "600", 
    marginBottom: "8px", 
    display: "block",
    color: "#374151" 
  }}>
    Event Description
  </label>
  <textarea
    id="description"
    value={eventDescription}
    onChange={(e) => setEventDescription(e.target.value)}
    placeholder="Describe your event... or let AI generate it for you!"
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      fontSize: "15px",
      minHeight: "140px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      resize: "vertical",
      lineHeight: "1.5"
    }}
  />
 <div style={{ display: "flex", gap: "12px", marginTop: "8px", alignItems: "center" }}>
  <button
    onClick={generateDescription}
    className="btn-animate"
    style={{
      padding: "10px 20px",
      background: "#ff7a00",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    {isGeneratingDescription ? "✨ Generating..." : "✨ Generate with AI"}
  </button>

  <button
    onClick={() => setEventDescription("")}
    style={{
      padding: "10px 20px",
      background: "#fff",
      color: "#666",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Clear
  </button>
</div>

  <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
    💡 Fill in the event details above, then click "Generate with AI" to create a description
  </p>
</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={() => {
                const newEvent = {
                  title: (document.getElementById("title") as HTMLInputElement).value,
                  date: (document.getElementById("date") as HTMLInputElement).value,
                  location: (document.getElementById("location") as HTMLInputElement).value,
                  category: (document.getElementById("category") as HTMLSelectElement).value,
                  image: (document.getElementById("image") as HTMLInputElement).value,
                  lat: Number((document.getElementById("lat") as HTMLInputElement).value),
                  lng: Number((document.getElementById("lng") as HTMLInputElement).value),
                  description: eventDescription,
                  saved: 0,
                  attending: 0,
                  owner: fakeUser,
                  views: 0,
                  clicks: 0,
                  status: "published",
                  attendees: []
                };
                if (editingEvent !== null) {
                  setEvents(prev => prev.map((e, _i) => (_i === editingEvent ? { ...e, ...newEvent } : e)));
                  setEditingEvent(null);
                } else {
                  setEvents(prev => [newEvent, ...prev]);
                }
                alert("Event saved successfully!");
                setScreen("dashboard");
              }} className="btn-animate glow-button" style={{ flex: 1, padding: "14px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>{editingEvent !== null ? "Save Changes" : "Add Activity"}</button>
             <button onClick={() => { setEditingEvent(null); setEventDescription(""); setScreen("dashboard"); }} className="btn-animate" style={{ flex: 1, padding: "14px", background: "#eee", color: "#666", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>← Back to Dashboard</button>
            </div>
          </div>
        </div>
        <style>{`
          .wavy-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,122,0,0.03) 0%, rgba(251,191,36,0.03) 50%, rgba(234,88,12,0.03) 100%);
            animation: wave 20s ease-in-out infinite;
            z-index: 0;
          }
          .glow-border {
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #ff7a00, #fbbf24, #ea580c);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(8px);
          }
          .bento-card:hover .glow-border {
            opacity: 0.5;
          }
          .glow-button {
            box-shadow: 0 4px 20px rgba(255,122,0,0.4);
          }
          .btn-animate {
            transition: all 0.3s ease;
          }
          .btn-animate:hover {
            transform: translateY(-2px);
          }
          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-10%); }
          }
        `}</style>
      </div>
    );
  }

  // ========== SCREEN: DASHBOARD ==========
  if (screen === "dashboard") {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", position: "relative" }}>
        <div className="wavy-background"></div>
        
        {/* DASHBOARD HEADER */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>Organizer Dashboard</div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>Welcome back, {fakeUser}</div>
          </div>
          <button onClick={handleLogout} className="btn-animate" style={{ padding: "10px 20px", background: "#fff", color: "#e65100", border: "1px solid #e65100", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Logout</button>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ padding: "24px 40px", background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: "76px", zIndex: 90, backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", gap: "12px", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "events", label: "My Events" },
              { id: "analytics", label: "Analytics" },
              { id: "attendees", label: "Attendees" }
            ].map(tab => (
              <button key={tab.id} onClick={() => setDashboardTab(tab.id)} className="btn-animate" style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: dashboardTab === tab.id ? "#ff7a00" : "#fff", color: dashboardTab === tab.id ? "#fff" : "#666", cursor: "pointer", fontSize: "14px", fontWeight: dashboardTab === tab.id ? "600" : "500", boxShadow: dashboardTab === tab.id ? "0 4px 12px rgba(255,122,0,0.25)" : "0 2px 4px rgba(0,0,0,0.05)" }}>{tab.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          {/* OVERVIEW TAB */}
          {dashboardTab === "overview" && (
            <div>
              {/* Stats Grid */}
              <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <StatCard label="Total Events" value={organizerEvents.length} trend="+3 this week" />
                <StatCard label="Total Attendees" value={totalAttending} trend="+25% growth" />
                <StatCard label="Total Views" value={organizerEvents.reduce((sum, e) => sum + (e.views || 0), 0)} trend="Trending up" />
                <StatCard label="Avg. Interested" value={Math.round(totalAttending / (organizerEvents.length || 1))} trend="Per event" />
              </div>

              {/* Quick Actions */}
              <div className="bento-card" style={{ background: "#fff", padding: "32px", borderRadius: "20px", marginBottom: "32px", position: "relative" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Quick Actions</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button onClick={() => setScreen("add")} className="btn-animate glow-button" style={{ padding: "12px 24px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Create New Event</button>
                  <button onClick={() => setDashboardTab("analytics")} className="btn-animate" style={{ padding: "12px 24px", background: "#fff", color: "#ff7a00", border: "2px solid #ff7a00", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>View Analytics</button>
                  <button onClick={emailAllAttendees} className="btn-animate" style={{ padding: "12px 24px", background: "#fff", color: "#3b82f6", border: "2px solid #3b82f6", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Email Attendees Summary</button>
                  <button onClick={exportOrganizerData} className="btn-animate" style={{ padding: "12px 24px", background: "#fff", color: "#10b981", border: "2px solid #10b981", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Export Data</button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bento-card" style={{ background: "#fff", padding: "32px", borderRadius: "20px", position: "relative" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Recent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    "5 new attendees for 'Morning Yoga in the Park'",
                    "Your event 'Live Indie Music Concert' reached 412 views",
                    "'Cycling Community Ride' got 15 interested users",
                    "New comment on 'Weekend Book Club Meetup'"
                  ].map((activity, _i) => (
                    <div key={i} style={{ padding: "16px", background: "#f9fafb", borderRadius: "10px", fontSize: "14px", color: "#374151", borderLeft: "4px solid #ff7a00" }}>{activity}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MY EVENTS TAB */}
          {dashboardTab === "events" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1f2937" }}>Your Events ({organizerEvents.length})</h2>
                <button onClick={() => setScreen("add")} className="btn-animate glow-button" style={{ padding: "10px 20px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Create Event</button>
              </div>

              {organizerEvents.length === 0 ? (
                <div className="bento-card" style={{ background: "#fff", padding: "80px 40px", borderRadius: "20px", textAlign: "center", position: "relative" }}>
                  <div className="glow-border"></div>
                  <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "#9ca3af" }}>+</div>
                  <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>No Events Yet</h3>
                  <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>Create your first event to get started!</p>
                  <button onClick={() => setScreen("add")} className="btn-animate glow-button" style={{ padding: "12px 24px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Create Your First Event</button>
                </div>
              ) : (
                <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
                  {organizerEvents.map((event, _i) => {
                    const actualIndex = events.findIndex(e => e === event);
                    return (
                      <div key={actualIndex} className="bento-card activity-card-glow" style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", position: "relative", transition: "transform 0.3s ease" }}>
                        <div className="glow-border"></div>
                        <img src={event.image} alt={event.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                        <div style={{ padding: "20px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>{event.title}</h3>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>{event.date}</div>
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>{event.location}</div>
                          <div style={{ display: "inline-block", padding: "4px 12px", background: event.status === "published" ? "#d1fae5" : "#fee2e2", color: event.status === "published" ? "#065f46" : "#991b1b", borderRadius: "999px", fontSize: "12px", fontWeight: "600", marginBottom: "16px" }}>{event.status === "published" ? "Published" : "Draft"}</div>
                          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                            <div style={{ flex: 1, textAlign: "center" }}>
                              <div style={{ fontSize: "18px", fontWeight: "700", color: "#ff7a00" }}>{event.views || 110}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>views</div>
                            </div>
                            <div style={{ flex: 1, textAlign: "center", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                              <div style={{ fontSize: "18px", fontWeight: "700", color: "#ff7a00" }}>{event.clicks || 80}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>clicks</div>
                            </div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                              <div style={{ fontSize: "18px", fontWeight: "700", color: "#ff7a00" }}>{event.attending}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>interested</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button onClick={() => { setEditingEvent(actualIndex); setScreen("add"); }} className="btn-animate" style={{ padding: "8px 16px", border: "1px solid #ff7a00", background: "#fff", color: "#ff7a00", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Edit</button>
                            <button onClick={() => setSelectedEvent(actualIndex)} className="btn-animate" style={{ padding: "8px 16px", border: "1px solid #3b82f6", background: "#fff", color: "#3b82f6", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>View Stats</button>
                            <button onClick={() => { if (confirm("Are you sure you want to delete this event?")) { setEvents(prev => prev.filter((_, idx) => idx !== actualIndex)); } }} className="btn-animate" style={{ padding: "8px 16px", border: "1px solid #dc2626", background: "#fff", color: "#dc2626", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginLeft: "auto" }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {dashboardTab === "analytics" && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "32px", color: "#1f2937" }}>Performance Analytics</h2>
              
              {/* Stats Grid */}
              <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <StatCard label="Total Views" value={ANALYTICS.totalViews} trend="+18% vs last month" />
                <StatCard label="Total Clicks" value={ANALYTICS.totalClicks} trend="+22% engagement" />
                <StatCard label="Total Interested" value={ANALYTICS.totalInterested} trend="+15% growth" />
                <StatCard label="Engagement Rate" value={ANALYTICS.engagementRate} trend="Above average" />
              </div>

              {/* Top Events */}
              <div className="bento-card" style={{ background: "#fff", padding: "32px", borderRadius: "20px", marginBottom: "32px", position: "relative" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Top Performing Events</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {ANALYTICS.topEvents.map((event, _i) => (
                    <div key={i} style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>{event.title}</div>
                        <div style={{ fontSize: "14px", color: "#666" }}>{event.category} • {event.date}</div>
                      </div>
                      <div style={{ display: "flex", gap: "24px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#ff7a00" }}>{event.views}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>views</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#ff7a00" }}>{event.clicks}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>clicks</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#ff7a00" }}>{event.interested}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>interested</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bento-card" style={{ background: "#fff", padding: "32px", borderRadius: "20px", position: "relative" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Events by Category</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
                  {ANALYTICS.categoryBreakdown.map(cat => (
                    <div key={cat.name} style={{ padding: "20px", background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(255,122,0,0.2)" }}>
                      <div style={{ fontSize: "32px", fontWeight: "800", color: "#ff7a00", marginBottom: "4px" }}>{cat.count}</div>
                      <div style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>{cat.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ATTENDEES TAB */}
          {dashboardTab === "attendees" && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px", color: "#1f2937" }}>Attendee Management</h2>
              <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>All Attendees ({totalAttending} total)</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {organizerEvents.map((event, _i) => (
                  <div key={i} className="bento-card" style={{ background: "#fff", padding: "32px", borderRadius: "20px", position: "relative" }}>
                    <div className="glow-border"></div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#1f2937" }}>{event.title}</h3>
                    {event.attendees && event.attendees.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                              <th style={{ textAlign: "left", padding: "12px", fontSize: "14px", fontWeight: "700", color: "#374151" }}>Name</th>
                              <th style={{ textAlign: "left", padding: "12px", fontSize: "14px", fontWeight: "700", color: "#374151" }}>Email</th>
                              <th style={{ textAlign: "left", padding: "12px", fontSize: "14px", fontWeight: "700", color: "#374151" }}>Phone</th>
                              <th style={{ textAlign: "left", padding: "12px", fontSize: "14px", fontWeight: "700", color: "#374151" }}>Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.attendees.map((a, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937" }}>{a.name}</td>
                                <td style={{ padding: "12px", fontSize: "14px", color: "#666" }}>{a.email}</td>
                                <td style={{ padding: "12px", fontSize: "14px", color: "#666" }}>{a.phone}</td>
                                <td style={{ padding: "12px", fontSize: "14px", color: "#666" }}>{a.registeredDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: "40px", textAlign: "center", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#9ca3af" }}>No attendees yet</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EVENT DETAILS MODAL */}
  {selectedEvent !== null && (
  <div 
    onClick={() => { 
      setSelectedEvent(null); 
      
    }} 
    style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      background: "rgba(0,0,0,0.6)", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      zIndex: 10000, 
      padding: "20px" 
    }}
  >
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="bento-card" 
      style={{ 
        background: "#fff", 
        padding: "40px", 
        borderRadius: "20px", 
        maxWidth: "600px", 
        width: "100%", 
        maxHeight: "90vh", 
        overflowY: "auto", 
        position: "relative" 
      }}
    >
      <div className="glow-border"></div>

      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "24px" }}>
        Event Statistics
      </h2>

      <h3 style={{ fontSize: "20px", fontWeight: "700" }}>
        {events[selectedEvent].title}
      </h3>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        {events[selectedEvent].date} • {events[selectedEvent].location}
      </p>

      {/* STATS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          ["Views", HARD_CODED_EVENT_STATS.views],
          ["Clicks", HARD_CODED_EVENT_STATS.clicks],
          ["Interested", HARD_CODED_EVENT_STATS.interested],
          ["CTR", HARD_CODED_EVENT_STATS.ctr]
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#f9fafb", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#ff7a00" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{label}</div>
          </div>
        ))}
      </div>
          {/* CLOSE BUTTON */}
      <button 
        onClick={() => { 
          setSelectedEvent(null); 
        
        }} 
        className="btn-animate glow-button" 
        style={{ 
          width: "100%", 
          padding: "12px", 
          background: "#ff7a00", 
          color: "#fff", 
          border: "none", 
          borderRadius: "10px", 
          cursor: "pointer", 
          fontSize: "14px", 
          fontWeight: "600" 
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

        <style>{`
          .wavy-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,122,0,0.03) 0%, rgba(251,191,36,0.03) 50%, rgba(234,88,12,0.03) 100%);
            animation: wave 20s ease-in-out infinite;
            z-index: 0;
          }
          .glow-border {
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #ff7a00, #fbbf24, #ea580c);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(8px);
          }
          .bento-card:hover .glow-border,
          .activity-card-glow:hover .glow-border,
          .stat-card-glow:hover .glow-border {
            opacity: 0.5;
          }
          .bento-card {
            transition: transform 0.3s ease;
          }
          .bento-card:hover {
            transform: translateY(-4px);
          }
          .glow-button {
            box-shadow: 0 4px 20px rgba(255,122,0,0.4);
            position: relative;
            overflow: hidden;
          }
          .glow-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          .btn-animate {
            transition: all 0.3s ease;
          }
          .btn-animate:hover {
            transform: translateY(-2px);
          }
          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-10%); }
          }
        `}</style>
      </div>
    );
  }

  // ========== SCREEN: HOME ==========
  // ========== SCREEN: HOME ==========
if (screen === "home") {


    return (
      <div style={{ minHeight: "100vh", background: "#fff", position: "relative" }}>
        <div className="wavy-background"></div>

        {/* HEADER */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 100, borderBottom: "1px solid rgba(255,122,0,0.1)" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>LocalBuzz</div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <div
  onClick={() => activitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
  style={{ cursor: "pointer", fontSize: "14px", color: "#484f59ff" }}
>
  Discover
</div>

            <div onClick={() => homeRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", fontSize: "14px", color: "#484f59ff" }}>Home</div>
            {userRole === "organizer" && <div onClick={() => setScreen("add")} style={{ cursor: "pointer", fontSize: "14px", color: "#484f59ff" }}>Add Activity</div>}
            {userRole === "organizer" && <div onClick={() => setScreen("dashboard")} style={{ cursor: "pointer", fontSize: "14px", color: "#484f59ff" }}>Dashboard</div>}
            <div onClick={() => { if (fakeUser) { handleLogout(); } else { setShowAuthModal(true); } }} style={{ cursor: "pointer", fontSize: "14px", color: "#e65100", fontWeight: 500 }}>{fakeUser ? "Logout" : "Sign In"}</div>
          </div>
        </div>

        {/* HERO */}
        <div ref={homeRef} style={{ padding: "120px 40px", textAlign: "center", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-block", padding: "8px 20px", background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", borderRadius: "999px", fontSize: "14px", fontWeight: "600", color: "#ea580c", marginBottom: "24px", border: "1px solid rgba(255,122,0,0.2)" }}>Discover what's happening in your neighborhood</div>
          <h1 style={{ fontSize: "64px", fontWeight: "800", marginBottom: "24px", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 50%, #dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.2" }}>
            Your Local Activity<br />Intelligence Platform
          </h1>
          <p style={{ fontSize: "20px", color: "#666", marginBottom: "40px", maxWidth: "700px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            From society pujas to running groups, from temple jagratas to book clubs — discover everything happening around you, even the events that never make it online.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
           <button
  onClick={() => activitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
  className="btn-animate glow-button"
  style={{ padding: "14px 28px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}
>
  Explore Activities
</button>

            {userRole === "organizer" && <button onClick={() => setScreen("add")} className="btn-animate" style={{ padding: "14px 28px", background: "#ffffff", color: "#333", border: "1px solid #ccc", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>Add Your Activity</button>}
          </div>
        </div>

        {/* STATS SECTION */}
        <div style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            <StatCard label="Local Activities" value={10000} trend="+25% this month" />
            <StatCard label="Communities" value={500} trend="+12% growth" />
            <StatCard label="Cities" value={50} trend="Expanding fast" />
            <StatCard label="User Satisfaction" value={98} trend="Excellent rating" />
          </div>
        </div>

        {/* THREE LAYERS SECTION */}
        <div style={{ padding: "80px 40px", background: "rgba(255,247,237,0.5)", position: "relative" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "48px", fontWeight: "800", textAlign: "center", marginBottom: "16px", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Three Layers of Local Life</h2>
            <p style={{ fontSize: "18px", color: "#666", textAlign: "center", marginBottom: "60px", maxWidth: "700px", margin: "0 auto 60px" }}>We capture activities that other platforms miss — from formal events to informal community gatherings</p>
            
            <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
              <div className="bento-card layer-card" style={{ background: "linear-gradient(135deg, #fff 0%, #fff7ed 100%)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Formal Events</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Concerts, workshops, college fests and ticketed shows</p>
                <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500" alt="Events" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Concerts", "Workshops", "College Fests", "Shows"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(255,122,0,0.1)", color: "#ea580c", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(255,122,0,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="bento-card layer-card" style={{ background: "linear-gradient(135deg, #fff 0%, #fef3c7 100%)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Community Activities</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Religious gatherings, fitness groups, cultural meetups</p>
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500" alt="Community" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Temple Programs", "Running Groups", "Book Clubs", "NGO Drives"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(234,88,12,0.1)", color: "#c2410c", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(234,88,12,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="bento-card layer-card" style={{ background: "linear-gradient(135deg, #fff 0%, #fee2e2 100%)", padding: "40px", borderRadius: "24px", position: "relative", overflow: "hidden" }}>
                <div className="glow-border"></div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>Local Gatherings</h3>
                <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>Society parties, celebrations, and informal meetups</p>
                <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500" alt="Gatherings" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Society Parties", "Birthday Celebrations", "Community Dinners"].map(tag => (
                    <span key={tag} className="tag-glow" style={{ padding: "6px 14px", background: "rgba(220,38,38,0.1)", color: "#991b1b", borderRadius: "999px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(220,38,38,0.2)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div style={{ padding: "120px 40px", textAlign: "center", background: "linear-gradient(180deg, rgba(255,247,237,0) 0%, rgba(255,247,237,0.8) 100%)", position: "relative", zIndex: 10 }}>
          <h2 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(135deg, #ff7a00 0%, #dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ready to discover your local community?</h2>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>Join thousands of users who never miss what's happening in their neighborhood. From religious gatherings to fitness groups — find it all on Local Buzz.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
  onClick={() => activitiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
  className="btn-animate glow-button" 
  style={{ padding: "14px 28px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}
>
  Start Exploring
</button>
           <button
  onClick={() => { 
    setSelectedRole("organizer"); 
    setAuthMode("signup"); 
    setShowAuthModal(true);
  }}
  className="btn-animate"
  style={{
    padding: "14px 28px",
    background: "#ffffff",
    color: "#ff7a00",
    border: "2px solid #ff7a00",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: 600
  }}
>
  I'm an Organizer
</button>
          </div>
        </div>
       {/* AI SEARCH BAR */}

        {/* ACTIVITIES */}
        <div ref={activitiesRef} style={{ padding: "80px 40px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <h2 style={{ fontSize: "40px", fontWeight: "800", marginBottom: "32px", textAlign: "center", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Discover Local Activities</h2>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "40px", flexWrap: "wrap" }}>
            {["ALL", "5", "10"].map(v => (
              <button key={v} onClick={() => setDistanceFilter(v)} className="btn-animate" style={{ padding: "8px 16px", borderRadius: "999px", border: distanceFilter === v ? "1px solid #ff7a00" : "1px solid #ddd", background: distanceFilter === v ? "#ff7a00" : "#fff", color: distanceFilter === v ? "#fff" : "#333", cursor: "pointer", fontWeight: "600" }}>{v === "ALL" ? "All" : `Within ${v} km`}</button>
            ))}
          </div>
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
  {enrichedEvents.map((event, _i) => (
    <div key={i} className="bento-card activity-card-glow" style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", position: "relative" }}>
      <div className="glow-border"></div>
      <img src={event.image} alt={event.title} style={{ width: "100%", height: "220px", objectFit: "cover" }} />
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>{event.title}</h3>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>{event.date}</div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>{event.location}</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <button onClick={async (e) => {
            e.stopPropagation();
            const email = prompt("Enter your email for reminder");
            if (!email) return;
            try {
              await emailjs.send("service_r88bii1", "template_gaw1bh8", {
                to_email: email,
                event_title: event.title,
                event_time: event.date,
                event_location: event.location,
                from_name: "LocalBuzz",
                reply_to: email
              }, "ieRqsJaLCeqScpn6x");
              alert("Email sent successfully!");
            } catch (err) {
              console.error("EmailJS error:", err);
              alert("Email failed. Check console.");
            }
          }} className="btn-animate" style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #ff7a00", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#ff7a00" }}>Remind me</button>
          <button onClick={(e) => { e.stopPropagation(); incrementAttending(i); }} className="btn-animate" style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #ff7a00", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#ff7a00" }}>{event.attending} interested</button>
          <button onClick={(e) => { e.stopPropagation(); setViewingEventDetail(i); }} className="btn-animate" style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #3b82f6", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#3b82f6" }}>View More</button>
        </div>
        <div style={{ fontSize: "13px", color: "#999", fontWeight: "600" }}>{event.distance.toFixed(1)} km away</div>
      </div>
    </div>
  ))}
</div>
{/* EVENT DETAIL MODAL */}
{viewingEventDetail !== null && (
  <div 
    onClick={() => setViewingEventDetail(null)} 
    style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      background: "rgba(0,0,0,0.6)", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      zIndex: 10000, 
      padding: "20px" 
    }}
  >
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="bento-card" 
      style={{ 
        background: "#fff", 
        padding: "40px", 
        borderRadius: "20px", 
        maxWidth: "700px", 
        width: "100%", 
        maxHeight: "90vh", 
        overflowY: "auto", 
        position: "relative" 
      }}
    >
      <div className="glow-border"></div>
      
      {/* Event Image */}
      <img 
        src={enrichedEvents[viewingEventDetail].image} 
        alt={enrichedEvents[viewingEventDetail].title} 
        style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "12px", marginBottom: "24px" }} 
      />
      
      {/* Event Title */}
      <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "16px", color: "#1f2937" }}>
        {enrichedEvents[viewingEventDetail].title}
      </h2>
      
      {/* Event Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#ff7a00" }}></span>
          <span style={{ fontSize: "16px", color: "#666" }}>{enrichedEvents[viewingEventDetail].date}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#ff7a00" }}></span>
          <span style={{ fontSize: "16px", color: "#666" }}>{enrichedEvents[viewingEventDetail].location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#ff7a00" }}></span>
          <span style={{ fontSize: "16px", color: "#666" }}>{enrichedEvents[viewingEventDetail].distance.toFixed(1)} km away</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#ff7a00" }}></span>
          <span style={{ fontSize: "16px", color: "#666" }}>{enrichedEvents[viewingEventDetail].category}</span>
        </div>
      </div>
      
      {/* AI-Generated Description */}
      {enrichedEvents[viewingEventDetail].description && (
        <div style={{ marginBottom: "24px", padding: "20px", background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%)", borderRadius: "12px", border: "2px solid rgba(255,122,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "18px" }}>✨</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ea580c", margin: 0 }}>About This Event</h3>
          </div>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.6", margin: 0 }}>
            {enrichedEvents[viewingEventDetail].description}
          </p>
        </div>
      )}
      
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>{enrichedEvents[viewingEventDetail].views || 90}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Views</div>
        </div>
        <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>{enrichedEvents[viewingEventDetail].clicks || 45}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Clicks</div>
        </div>
        <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00" }}>{enrichedEvents[viewingEventDetail].attending}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Interested</div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={() => {
            incrementAttending(viewingEventDetail);
            alert("You're now marked as interested!");
          }}
          className="btn-animate glow-button" 
          style={{ 
            flex: 1,
            padding: "14px", 
            background: "#ff7a00", 
            color: "#fff", 
            border: "none", 
            borderRadius: "10px", 
            cursor: "pointer", 
            fontSize: "15px", 
            fontWeight: "600" 
          }}
        >
          I'm Interested
        </button>
        <button 
          onClick={() => setViewingEventDetail(null)} 
          className="btn-animate" 
          style={{ 
            flex: 1,
            padding: "14px", 
            background: "#fff", 
            color: "#666", 
            border: "1px solid #d1d5db", 
            borderRadius: "10px", 
            cursor: "pointer", 
            fontSize: "15px", 
            fontWeight: "600" 
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
        </div>

        {/* FOOTER */}
        <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", color: "#fff", padding: "60px 40px 30px", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", color: "#ff7a00" }}>LocalBuzz</div>
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>Discover hyper-local activities in your neighborhood. From formal events to community gatherings — never miss what's happening near you.</p>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Discover</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["All Activities", "Events & Concerts", "Community Activities", "Local Gatherings"].map(item => (
                  <li key={item} style={{ marginBottom: "8px" }}>
                    <span onClick={() => activitiesRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>For Organizers</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {userRole === "organizer" ? (
                  <>
                    <li style={{ marginBottom: "8px" }}><span onClick={() => setScreen("dashboard")} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Organizer Dashboard</span></li>
                    <li style={{ marginBottom: "8px" }}><span onClick={() => setScreen("add")} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Submit Activity</span></li>
                  </>
                ) : (
                  <>
                    <li style={{ marginBottom: "8px" }}><span style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Organizer Dashboard</span></li>
                    <li style={{ marginBottom: "8px" }}><span style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Submit Activity</span></li>
                  </>
                )}
                <li style={{ marginBottom: "8px" }}>
                  <span onClick={() => {
                    if (screen === "pricing") {
                      pricingCardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      setScreen("pricing");
                      setTimeout(() => {
                        pricingCardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                  }} style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>Pricing</span>
                </li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Company</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map(item => (
                  <li key={item} style={{ marginBottom: "8px" }}>
                    <span style={{ cursor: "pointer", fontSize: "14px", color: "#ffa52fff", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "#f4c395ff")} onMouseLeave={e => (e.currentTarget.style.color = "#ffa52fff")}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px", textAlign: "center", fontSize: "14px", color: "#9ca3af" }}>© 2025 LocalBuzz. All rights reserved. Made with love for local communities</div>
        </div>

        {showAuthModal && <AuthModal />}
        {showLoginPrompt && (
          <div onClick={() => setShowLoginPrompt(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
            <div onClick={e => e.stopPropagation()} className="bento-card" style={{ background: "#fff", padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "500px", boxShadow: "0 25px 70px rgba(0,0,0,0.4)", position: "relative" }}>
              <div className="glow-border"></div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>Organizer Dashboard Access Required</h3>
              <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>Please sign in with your organizer account to access the dashboard and manage your events.</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => { setShowLoginPrompt(false); setShowAuthModal(true); }} className="btn-animate glow-button" style={{ padding: "12px 24px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>Sign In Now</button>
                <button onClick={() => setShowLoginPrompt(false)} className="btn-animate" style={{ padding: "12px 24px", background: "#eee", color: "#666", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-5%) translateY(-5%); }
            50% { transform: translateX(-10%) translateY(5%); }
            75% { transform: translateX(-5%) translateY(-5%); }
          }
          .wavy-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(135deg, 
              rgba(255,122,0,0.05) 0%,
              rgba(251,191,36,0.05) 25%,
              rgba(234,88,12,0.05) 50%,
              rgba(220,38,38,0.05) 75%,
              rgba(255,122,0,0.05) 100%
            );
            animation: wave 20s ease-in-out infinite;
            z-index: 0;
            opacity: 0.6;
          }
          .wavy-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, rgba(255,122,0,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(234,88,12,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(251,191,36,0.1) 0%, transparent 50%);
            animation: wave 15s ease-in-out infinite reverse;
          }
          .glow-border {
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #ff7a00, #fbbf24, #ea580c, #dc2626);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(8px);
          }
          .stat-card-glow:hover .glow-border,
          .auth-modal-glow .glow-border,
          .bento-card:hover .glow-border,
          .activity-card-glow:hover .glow-border,
          .pricing-card-glow:hover .glow-border {
            opacity: 0.6;
          }
          .bento-card {
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .bento-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(255,122,0,0.2);
          }
          .layer-card {
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          .tag-glow {
            position: relative;
            transition: all 0.3s ease;
          }
          .tag-glow:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(255,122,0,0.3);
          }
          .glow-button {
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(255,122,0,0.4);
          }
          .glow-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          .btn-animate {
            transition: all 0.3s ease;
          }
          .btn-animate:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
          .btn-animate:active {
            transform: translateY(0);
          }
        `}</style>
      </div>
    );
  }

  // ========== SCREEN: PRICING ==========
  if (screen === "pricing") {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", position: "relative" }}>
        <div className="wavy-background"></div>

        {/* HEADER */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", zIndex: 100, borderBottom: "1px solid rgba(255,122,0,0.1)" }}>
          <div onClick={() => setScreen("landing")} style={{ fontSize: "24px", fontWeight: "800", color: "#ff7a00", cursor: "pointer" }}>LocalBuzz</div>
          <button onClick={() => setScreen("landing")} className="btn-animate" style={{ padding: "10px 20px", background: "#fff", color: "#666", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Back</button>
        </div>

        {/* HERO */}
        <div style={{ padding: "120px 40px 60px", textAlign: "center", maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <h1 style={{ fontSize: "56px", fontWeight: "800", marginBottom: "20px", background: "linear-gradient(135deg, #ff7a00 0%, #ea580c 50%, #dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.2" }}>
            Simple pricing for your<br />community
          </h1>
          <p style={{ fontSize: "20px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>Free for explorers. Powerful tools for organizers.</p>
        </div>

        {/* PLANS */}
        <div ref={pricingCardsRef} style={{ padding: "60px 40px 120px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px", alignItems: "start" }}>
            {/* CUSTOMER PLAN */}
            <div className="bento-card pricing-card-glow" style={{ background: "linear-gradient(135deg, #fff 0%, #fff7ed 100%)", padding: "40px", borderRadius: "24px", position: "relative", border: "2px solid rgba(255,122,0,0.2)" }}>
              <div className="glow-border"></div>
              <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>Customer</div>
              <div style={{ fontSize: "48px", fontWeight: "800", marginBottom: "8px", color: "#ff7a00" }}>₹99</div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>Discover everything near you</div>
              <div style={{ marginBottom: "32px" }}>
                {[
                  "Unlimited discovery",
                  "Event reminders",
                  "Distance filtering"
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", fontSize: "15px", color: "#374151" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ff7a00", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>✓</div>
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={() => handleStripePayment("customer")} className="btn-animate glow-button" style={{ width: "100%", padding: "14px", background: "#ff7a00", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>Start Exploring</button>
            </div>

            {/* ORGANIZER PLAN */}
            <div className="bento-card pricing-card-glow" style={{ background: "linear-gradient(135deg, #fff 0%, #fee2e2 100%)", padding: "40px", borderRadius: "24px", position: "relative", border: "2px solid rgba(220,38,38,0.2)", transform: "scale(1.05)" }}>
              <div className="glow-border"></div>
              <div style={{ display: "inline-block", padding: "6px 14px", background: "#dc2626", color: "#fff", borderRadius: "999px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>POPULAR</div>
              <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>Organizer</div>
              <div style={{ fontSize: "48px", fontWeight: "800", marginBottom: "8px", color: "#dc2626" }}>
                ₹499<span style={{ fontSize: "18px", fontWeight: "500", color: "#666" }}> / month</span>
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>Grow and manage your events</div>
              <div style={{ marginBottom: "32px" }}>
                {[
                  "Unlimited events",
                  "Analytics dashboard",
                  "Attendee export"
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", fontSize: "15px", color: "#374151" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>✓</div>
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={() => handleStripePayment("organizer")} className="btn-animate glow-button" style={{ width: "100%", padding: "14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontWeight: "700" }}>Become Organizer</button>
            </div>
          </div>
        </div>

        {showAuthModal && <AuthModal />}

        <style>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-5%) translateY(-5%); }
            50% { transform: translateX(-10%) translateY(5%); }
            75% { transform: translateX(-5%) translateY(-5%); }
          }
          .wavy-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(135deg, 
              rgba(255,122,0,0.05) 0%,
              rgba(251,191,36,0.05) 25%,
              rgba(234,88,12,0.05) 50%,
              rgba(220,38,38,0.05) 75%,
              rgba(255,122,0,0.05) 100%
            );
            animation: wave 20s ease-in-out infinite;
            z-index: 0;
            opacity: 0.6;
          }
          .wavy-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, rgba(255,122,0,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(234,88,12,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(251,191,36,0.1) 0%, transparent 50%);
            animation: wave 15s ease-in-out infinite reverse;
          }
          .glow-border {
            position: absolute;
            inset: -2px;
            background: linear-gradient(135deg, #ff7a00, #fbbf24, #ea580c, #dc2626);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(8px);
          }
          .pricing-card-glow:hover .glow-border,
          .bento-card:hover .glow-border {
            opacity: 0.6;
          }
          .bento-card {
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .bento-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(255,122,0,0.2);
          }
          .glow-button {
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(255,122,0,0.4);
          }
          .glow-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          .btn-animate {
            transition: all 0.3s ease;
          }
          .btn-animate:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>
    );
  }

  return null;
}

export default App;



