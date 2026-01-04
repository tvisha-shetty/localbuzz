import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";

function AddEvent({ user }: any) {
  const [title, setTitle] = useState("");

  const submit = async () => {
    if (!title) {
      alert("Enter title");
      return;
    }

    await addDoc(collection(db, "events"), {
      title,
      date: "Sun, 20 Dec",
      venue: "Hyderabad",
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      stats: {  saves: 0, attends: 0 }
    });

    alert("Event added");
    setTitle("");
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        placeholder="Event title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button onClick={submit}>Add Event</button>
    </div>
  );
}

export default AddEvent;
