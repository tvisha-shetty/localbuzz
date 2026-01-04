import EventCard from "./EventCard";

type Props = {
  title: string;
  events: any[];
};

function EventRow({ title, events }: Props) {
  return (
    <div className="section">
      <div className="section-header">
        <h2>{title}</h2>
        <span>See All</span>
      </div>

      <div className="row">
        {events.map(e => (
          <EventCard key={e.id} {...e} />
        ))}
      </div>
    </div>
  );
}

export default EventRow;
