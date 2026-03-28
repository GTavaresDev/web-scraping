import type { TrackingEvent } from "@/lib/types";

type TrackingTimelineProps = {
  events: TrackingEvent[];
};

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={`${event.dateTime}-${event.description}-${index}`} className="relative pl-8 pb-8 last:pb-0">
          {index < events.length - 1 ? (
            <div className="absolute top-6 bottom-0 left-[11px] w-0.5 bg-slate-200" />
          ) : null}
          <div
            className={`absolute top-1 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              index === 0
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-white"
            }`}
          >
            {index === 0 ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
          </div>
          <div>
            <p className={`text-sm font-medium ${index === 0 ? "text-slate-900" : "text-slate-500"}`}>
              {event.description}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {event.dateTime || "Data indisponível"} · {event.location}
              {event.unit ? ` · ${event.unit}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
