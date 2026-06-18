import { requireUser } from "@/lib/auth";
import { getBookingsForUser } from "@/lib/user-bookings";
import { Calendar, MapPin, Building2, Utensils, Clock } from "lucide-react";
import Link from "next/link";

export default async function BookingsPage() {
    const user = await requireUser();
    const { bookings, RestaurantDetails, accommodationDetails } = await getBookingsForUser(user.id);

    return (
        <section className="rounded-2xl border border-md-gold/20 bg-white/90 px-6 py-8 shadow-lg backdrop-blur-sm sm:px-10 sm:py-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-md-sand/50 text-md-green shadow-inner">
                    <Calendar className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                        Your Trips
                    </p>
                    <h2 className="mt-1 font-display text-3xl font-bold text-md-brown-dark">
                        My Bookings
                    </h2>
                </div>
            </div>

            {bookings && bookings.length > 0 ? (
                <div className="grid gap-6">
                    {bookings.map((booking: any) => {
                        const isHotel = booking.type === 'hotel' || booking.type === 'accommodation';
                        const hotelDetails = isHotel ? accommodationDetails?.find((d: any) => d.booking_id === booking.id) : null;
                        const restDetails = !isHotel ? RestaurantDetails?.find((d: any) => d.booking_id === booking.id) : null;

                        return (
                            <div key={booking.id} className="group relative overflow-hidden rounded-xl border border-md-sand-dark bg-md-cream/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-md-gold/40 hover:bg-md-cream hover:shadow-md">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {isHotel ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                                    <Building2 className="h-3 w-3" /> Hotel
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                                                    <Utensils className="h-3 w-3" /> Restaurant
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-md-brown-dark mb-1">
                                            {booking.etablissment?.name || 'Unknown Location'}
                                        </h3>
                                        {booking.etablissment?.city && (
                                            <p className="flex items-center gap-1 text-sm text-md-muted">
                                                <MapPin className="h-4 w-4" /> {booking.etablissment.city}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-left sm:text-right">
                                        {isHotel && hotelDetails ? (
                                            <>
                                                <p className="text-sm font-semibold text-md-brown-dark">
                                                    {new Date(hotelDetails.check_in).toLocaleDateString()} - {new Date(hotelDetails.check_out).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-md-muted mt-1">{hotelDetails.guests} Guests • {hotelDetails.rooms} Rooms</p>
                                            </>
                                        ) : restDetails ? (
                                            <>
                                                <p className="text-sm font-semibold text-md-brown-dark flex items-center sm:justify-end gap-1">
                                                    <Calendar className="h-4 w-4" /> {new Date(restDetails.requested_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-md-muted mt-1 flex items-center sm:justify-end gap-1">
                                                    <Clock className="h-3.5 w-3.5" /> {restDetails.requested_time} • {restDetails.guests} Guests
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-md-muted">Date pending</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-md-gold/40 bg-md-cream/30 py-16 text-center">
                    <div className="rounded-full bg-md-cream p-4 shadow-sm mb-4">
                        <Calendar className="h-8 w-8 text-md-gold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-md-brown-dark mb-2">No bookings yet</h3>
                    <p className="text-md-muted max-w-sm mb-6">You haven't made any bookings yet. Start exploring Morocco's finest destinations.</p>
                    <Link
                        href="/destinations"
                        className="rounded-full bg-md-green px-6 py-2.5 text-sm font-bold text-md-cream shadow-sm transition hover:bg-md-green-soft"
                    >
                        Explore Destinations
                    </Link>
                </div>
            )}
        </section>
    );
}