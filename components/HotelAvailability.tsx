"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, BedDouble, Users, Hash, CircleDollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RoomType {
    id: string;
    name: string;
    maxGuests: number;
    units: number;
    basePrice: number;
}

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_ROOMS: RoomType[] = [
    { id: uid(), name: "Standard Room", maxGuests: 2, units: 5, basePrice: 800 },
    { id: uid(), name: "Suite", maxGuests: 4, units: 2, basePrice: 1600 },
];

export function HotelAvailability() {
    const [checkIn, setCheckIn] = useState("14:00");
    const [checkOut, setCheckOut] = useState("12:00");
    const [rooms, setRooms] = useState<RoomType[]>(DEFAULT_ROOMS);

    function addRoom() {
        setRooms((prev) => [
            ...prev,
            { id: uid(), name: "", maxGuests: 2, units: 1, basePrice: 0 },
        ]);
    }

    function removeRoom(id: string) {
        setRooms((prev) => prev.filter((r) => r.id !== id));
    }

    function updateRoom(id: string, field: keyof Omit<RoomType, "id">, value: string | number) {
        setRooms((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Check-in / Check-out ── */}
            <div>
                <p className="mb-4 text-sm font-bold text-md-brown-dark">Check-in &amp; Check-out times</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">
                            Check-in from
                        </Label>
                        <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" />
                            <input
                                type="time"
                                name="check_in_time"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full rounded-lg border border-md-sand-dark bg-md-cream/40 py-3 pl-10 pr-3 text-sm font-semibold text-md-brown-dark transition focus:border-md-gold focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">
                            Check-out by
                        </Label>
                        <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" />
                            <input
                                type="time"
                                name="check_out_time"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full rounded-lg border border-md-sand-dark bg-md-cream/40 py-3 pl-10 pr-3 text-sm font-semibold text-md-brown-dark transition focus:border-md-gold focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-md-gold/15" />

            {/* ── Room types ── */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-md-brown-dark">Room types</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRoom}
                        className="gap-1.5 rounded-full border-md-gold/30 text-xs font-bold text-md-brown-dark hover:border-md-gold hover:bg-md-sand"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add room type
                    </Button>
                </div>

                {/* column headers (desktop) */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_90px_70px_120px_50px] gap-3 px-4 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">
                    <span>Room name</span>
                    <span className="text-center">Max guests</span>
                    <span className="text-center">Units</span>
                    <span className="text-right">Base price</span>
                    <span />
                </div>

                <div className="space-y-3">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="group rounded-lg border border-md-gold/25 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-md-gold/40"
                        >
                            {/* desktop row */}
                            <div className="hidden sm:grid sm:grid-cols-[1fr_90px_70px_120px_50px] gap-3 items-center">
                                <div className="relative">
                                    <BedDouble className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                    <Input
                                        value={room.name}
                                        onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                                        placeholder="e.g. Deluxe Room"
                                        className="h-9 pl-9 border-md-sand-dark bg-md-cream/40 text-sm focus:border-md-gold focus:bg-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Users className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={room.maxGuests}
                                        onChange={(e) => updateRoom(room.id, "maxGuests", Number(e.target.value))}
                                        className="h-9 pl-9 border-md-sand-dark bg-md-cream/40 text-sm text-center focus:border-md-gold focus:bg-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                    <Input
                                        type="number"
                                        min={1}
                                        value={room.units}
                                        onChange={(e) => updateRoom(room.id, "units", Number(e.target.value))}
                                        className="h-9 pl-9 border-md-sand-dark bg-md-cream/40 text-sm text-center focus:border-md-gold focus:bg-white"
                                    />
                                </div>
                                <div className="relative">
                                    <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={room.basePrice}
                                        onChange={(e) => updateRoom(room.id, "basePrice", Number(e.target.value))}
                                        className="h-9 pl-9 pr-14 border-md-sand-dark bg-md-cream/40 text-sm text-right focus:border-md-gold focus:bg-white"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-md-muted">
                                        MAD
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRoom(room.id)}
                                    className="grid h-8 w-8 place-items-center rounded-lg text-md-muted transition hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                    aria-label="Remove room type"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* mobile stack */}
                            <div className="grid gap-3 sm:hidden">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-md-gold-dark">Room name</label>
                                    <div className="relative">
                                        <BedDouble className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-md-muted" />
                                        <Input
                                            value={room.name}
                                            onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                                            placeholder="e.g. Deluxe Room"
                                            className="h-10 pl-9 border-md-sand-dark bg-md-cream/40 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-md-gold-dark">Guests</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={room.maxGuests}
                                            onChange={(e) => updateRoom(room.id, "maxGuests", Number(e.target.value))}
                                            className="h-10 border-md-sand-dark bg-md-cream/40 text-sm text-center"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-md-gold-dark">Units</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={room.units}
                                            onChange={(e) => updateRoom(room.id, "units", Number(e.target.value))}
                                            className="h-10 border-md-sand-dark bg-md-cream/40 text-sm text-center"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-md-gold-dark">Price</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min={0}
                                                value={room.basePrice}
                                                onChange={(e) => updateRoom(room.id, "basePrice", Number(e.target.value))}
                                                className="h-10 pr-12 border-md-sand-dark bg-md-cream/40 text-sm text-right"
                                            />
                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-md-muted">
                                                MAD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRoom(room.id)}
                                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    {rooms.length === 0 && (
                        <div className="rounded-lg border border-dashed border-md-sand-dark bg-md-cream/40 px-6 py-10 text-center">
                            <BedDouble className="mx-auto h-8 w-8 text-md-muted" />
                            <p className="mt-3 text-sm font-bold text-md-brown-dark">No room types yet</p>
                            <p className="mt-1 text-xs text-md-muted">Click &ldquo;Add room type&rdquo; to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* hidden inputs for form submission */}
            <input type="hidden" name="room_types" value={JSON.stringify(rooms)} />
        </div>
    );
}