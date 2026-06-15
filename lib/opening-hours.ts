type ScheduleHours = {
  active?: boolean;
  start?: string;
  end?: string;
};

const WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const WEEKDAY_INDEX: ReadonlyMap<string, number> = new Map(
  WEEKDAY_ORDER.map((day, index) => [day, index]),
);

export function formatOpeningHoursValue(value: unknown) {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);

  const schedule = value as ScheduleHours;

  if (schedule.active === false) return "Closed";
  if (schedule.start && schedule.end) return `${schedule.start} - ${schedule.end}`;
  if (schedule.start) return schedule.start;
  if (schedule.end) return schedule.end;

  return "Hours unavailable";
}

export function getOpeningHoursEntries(
  openingHours: Record<string, unknown> | null | undefined,
) {
  if (!openingHours) return [];

  return Object.entries(openingHours).sort(([firstDay], [secondDay]) => {
    const firstIndex = WEEKDAY_INDEX.get(firstDay.toLowerCase());
    const secondIndex = WEEKDAY_INDEX.get(secondDay.toLowerCase());

    if (firstIndex !== undefined && secondIndex !== undefined) {
      return firstIndex - secondIndex;
    }

    if (firstIndex !== undefined) return -1;
    if (secondIndex !== undefined) return 1;

    return 0;
  });
}
