function EventCard({
  event,
  canEdit,
  onView,
  onSave,
  onAttend,
  onDelete
}: any) {
  const stats = event.stats || { views: 0, saves: 0, attends: 0 };
  const score = stats.views + stats.saves * 3 + stats.attends * 5;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        marginBottom: 12,
        padding: 12
      }}
    >
      <h3>{event.title}</h3>
      <p>{event.date}</p>
      <p>{event.venue}</p>

      <p>
        {stats.views} | {stats.saves} | {stats.attends}
      </p>

      <p>Score: {score}</p>

      <button onClick={onView}>View</button>
      <button onClick={onSave}>Save</button>
      <button onClick={onAttend}>Attend</button>

      {canEdit && (
        <button onClick={onDelete} style={{ marginLeft: 8 }}>
          Delete
        </button>
      )}
    </div>
  );
}

export default EventCard;
