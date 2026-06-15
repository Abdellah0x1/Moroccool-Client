"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

const DAYS = [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

interface DaySchedule {
    active: boolean;
    start: string;
    end: string;
}

const DEFAULT_SCHEDULE: Record<DayKey, DaySchedule> = {
    monday: { active: true, start: "09:00", end: "22:00" },
    tuesday: { active: true, start: "09:00", end: "22:00" },
    wednesday: { active: true, start: "09:00", end: "22:00" },
    thursday: { active: true, start: "09:00", end: "22:00" },
    friday: { active: true, start: "09:00", end: "23:00" },
    saturday: { active: true, start: "09:00", end: "23:00" },
    sunday: { active: false, start: "09:00", end: "22:00" },
};

export function RestaurantAvailability() {
    const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(DEFAULT_SCHEDULE);

    function toggle(day: DayKey) {
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active },
        }));
    }

    function updateTime(day: DayKey, field: "start" | "end", value: string) {
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    }

    return (
        <div className="space-y-3">
            {/* header row (desktop) */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_100px_100px] gap-4 px-4 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">
                <span>Day</span>
                <span className="text-center">Opens</span>
                <span className="text-center">Closes</span>
            </div>

            {DAYS.map(({ key, label, short }) => {
                const day = schedule[key];

                return (
                    <div
                        key={key}
                        className={`group rounded-lg border px-4 py-3.5 transition-all duration-200 ${
                            day.active
                                ? "border-md-gold/25 bg-white shadow-sm"
                                : "border-md-sand-dark/60 bg-md-cream/60"
                        }`}
                    >
                        <div className="grid items-center gap-4 sm:grid-cols-[1fr_100px_100px]">
                            {/* day toggle */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={day.active}
                                    onCheckedChange={() => toggle(key)}
                                    className="data-[state=checked]:bg-md-green"
                                />
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        day.active ? "text-md-brown-dark" : "text-md-muted"
                                    }`}
                                >
                                    <span className="sm:hidden">{short}</span>
                                    <span className="hidden sm:inline">{label}</span>
                                </span>

                                {!day.active && (
                                    <span className="ml-auto rounded-full border border-md-sand-dark bg-md-cream px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-md-muted sm:ml-2">
                                        Closed
                                    </span>
                                )}
                            </div>

                            {/* time pickers */}
                            {day.active && (
                                <>
                                    <div className="relative">
                                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                        <input
                                            type="time"
                                            value={day.start}
                                            onChange={(e) => updateTime(key, "start", e.target.value)}
                                            className="w-full rounded-lg border border-md-sand-dark bg-md-cream/40 py-2 pl-9 pr-2 text-sm text-md-brown-dark transition focus:border-md-gold focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                        <input
                                            type="time"
                                            value={day.end}
                                            onChange={(e) => updateTime(key, "end", e.target.value)}
                                            className="w-full rounded-lg border border-md-sand-dark bg-md-cream/40 py-2 pl-9 pr-2 text-sm text-md-brown-dark transition focus:border-md-gold focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* hidden inputs to submit the schedule as JSON */}
            <input type="hidden" name="opening_hours" value={JSON.stringify(schedule)} />
        </div>
    );
}
