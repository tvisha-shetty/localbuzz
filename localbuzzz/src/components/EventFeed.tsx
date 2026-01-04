import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import EventCard from "./EventCard";

function EventFeed({ user }: { user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 ALWAYS SET EVENTS AS ARRAY
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading events...</p>;
  }

  if (events.length === 0) {
    return <p style={{ padding: 20 }}>No events found</p>;
  }

  const inc = async (id: string, field: string) => {
    await updateDoc(doc(db, "events", id), {
      [`stats.${field}`]: increment(1)
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
  };

  return (
    <div style={{ padding: 20 }}>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          canEdit={user && event.createdBy === user.uid}
          onView={() => inc(event.id, "views")}
          onSave={() => inc(event.id, "saves")}
          onAttend={() => inc(event.id, "attends")}
          onDelete={() => remove(event.id)}
        />
      ))}
    </div>
  );
}

export default EventFeed;
