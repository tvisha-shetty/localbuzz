type Props = {
  event: any;
  onClose: () => void;
};

function EventModal({ event, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-lg"
        >
          ✕
        </button>

        {/* Poster */}
        <img
          src={event.poster}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />

        {/* Content */}
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="text-sm text-slate-500">{event.date}</p>
        <p className="text-sm text-slate-500">{event.location}</p>

        <div className="flex gap-6 text-sm mt-4">
          <span>👁 {event.views}</span>
          <span>❤️ {event.saves}</span>
          <span>🙋 {event.attends}</span>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 border rounded-md py-2">
            Save
          </button>
          <button className="flex-1 bg-blue-600 text-white rounded-md py-2">
            Attend
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
