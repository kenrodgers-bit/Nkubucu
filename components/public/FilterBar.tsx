"use client";

type FilterBarProps = {
  classValue: string;
  eventValue: string;
  classes: string[];
  events: string[];
  onClassChange: (value: string) => void;
  onEventChange: (value: string) => void;
};

export function FilterBar({
  classValue,
  eventValue,
  classes,
  events,
  onClassChange,
  onEventChange,
}: FilterBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select
        value={classValue}
        onChange={(event) => onClassChange(event.target.value)}
        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
        aria-label="Filter by class"
      >
        <option value="">All classes</option>
        {classes.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </select>
      <select
        value={eventValue}
        onChange={(event) => onEventChange(event.target.value)}
        className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
        aria-label="Filter by event"
      >
        <option value="">All events</option>
        {events.map((eventName) => (
          <option key={eventName} value={eventName}>
            {eventName}
          </option>
        ))}
      </select>
    </div>
  );
}
