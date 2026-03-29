import type { TrackingEvent } from "@/types";

type TrackingTimelineProps = {
  events: TrackingEvent[];
};

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative mx-auto max-w-2xl">
      {events.map((event, index) => (
        <div
          key={`${event.dateTime}-${event.description}-${index}`}
          className="relative pl-10 pb-7 last:pb-0 sm:pl-11"
        >
          {index < events.length - 1 ? (
            <div className="absolute top-7 bottom-0 left-[13px] w-px bg-slate-200 sm:left-[15px]" />
          ) : null}
          <div
            className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${
              index === 0
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-white"
            }`}
          >
            {index === 0 ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
          </div>
          <div className="rounded-xl bg-slate-50/70 px-4 py-3.5">
            <p
              className={`text-sm font-medium leading-6 ${
                index === 0 ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {event.description}
            </p>
            <p className="mt-2 text-xs font-medium tracking-wide text-slate-400">
              {event.dateTime || "Data indisponível"} · {event.location}
              {event.unit ? ` · ${event.unit}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
