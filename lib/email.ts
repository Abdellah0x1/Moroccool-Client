import "server-only";

import { Resend } from "resend";
import type { RestaurantBookingStatus } from "@/lib/bookings";

type RestaurantBookingEmailPayload = {
  customerEmail: string;
  customerName: string;
  restaurantName: string;
  status: RestaurantBookingStatus;
  requestedDate: string;
  requestedTime: string;
  guests: number;
  ownerNote?: string | null;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRestaurantBookingStatus(status: RestaurantBookingStatus) {
  if (status === "confirmed") return "confirmed";
  if (status === "rejected") return "declined";
  return status;
}

export async function sendRestaurantBookingStatusEmail(
  payload: RestaurantBookingEmailPayload,
) {
  if (payload.status !== "confirmed" && payload.status !== "rejected") return;

  const from = process.env.RESEND_FROM_EMAIL ?? "Moroccool <onboarding@resend.dev>";

  if (!resend) {
    console.warn("Skipping booking email: RESEND_API_KEY is not configured.");
    return;
  }

  const statusLabel = formatRestaurantBookingStatus(payload.status);
  const isConfirmed = payload.status === "confirmed";
  const subject = isConfirmed
    ? `Your table request at ${payload.restaurantName} is confirmed`
    : `Your table request at ${payload.restaurantName} was declined`;
  const ownerNote = payload.ownerNote?.trim();

  const headerColor = isConfirmed ? "#166534" : "#991b1b";
  const boxBgColor = isConfirmed ? "#f0fdf4" : "#fef2f2";
  const boxBorderColor = isConfirmed ? "#bbf7d0" : "#fecaca";
  const iconEmoji = isConfirmed ? "✅" : "❌";
  const statusCapitalized = statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Logo Header -->
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0; font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
          Moroc<span style="color: #ea580c;">cool</span>
        </h2>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${headerColor}; margin: 0; font-size: 24px;">
          ${iconEmoji} Booking ${statusCapitalized}
        </h1>
      </div>
      
      <p style="font-size: 16px; margin-top: 0;">Hi ${escapeHtml(payload.customerName)},</p>
      
      <p style="font-size: 16px; margin-bottom: 24px;">
        Your table request at <strong>${escapeHtml(payload.restaurantName)}</strong>
        has been <strong style="color: ${headerColor};">${statusLabel}</strong>.
      </p>
      
      <div style="margin: 24px 0; padding: 20px; border: 1px solid ${boxBorderColor}; border-radius: 12px; background-color: ${boxBgColor};">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: ${headerColor};">Reservation Details</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${boxBorderColor}; color: #6b7280; width: 80px;">Date</td>
            <td style="padding: 8px 0; border-bottom: 1px solid ${boxBorderColor}; font-weight: 600; color: #111827;">${escapeHtml(payload.requestedDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${boxBorderColor}; color: #6b7280;">Time</td>
            <td style="padding: 8px 0; border-bottom: 1px solid ${boxBorderColor}; font-weight: 600; color: #111827;">${escapeHtml(payload.requestedTime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Guests</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${payload.guests} people</td>
          </tr>
        </table>
      </div>

      ${
        ownerNote
          ? `
          <div style="margin: 24px 0; padding: 16px; border-left: 4px solid ${boxBorderColor}; background-color: #f9fafb;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Message from the restaurant</p>
            <p style="margin: 0; font-style: italic; color: #1f2937;">"${escapeHtml(ownerNote)}"</p>
          </div>
          `
          : ""
      }
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
        Thank you for using Moroccool.
      </p>
    </div>
  `;

  const text = [
    `Booking ${statusLabel}`,
    `Hi ${payload.customerName},`,
    `Your table request at ${payload.restaurantName} has been ${statusLabel}.`,
    `Date: ${payload.requestedDate}`,
    `Time: ${payload.requestedTime}`,
    `Guests: ${payload.guests}`,
    ownerNote ? `Restaurant note: ${ownerNote}` : "",
    "Thank you for using Moroccool.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { error } = await resend.emails.send({
    from,
    to: [payload.customerEmail],
    subject,
    html,
    text,
  }).catch((error: unknown) => ({ error }));

  if (error) {
    console.error("Error sending restaurant booking email:", error);
  }
}
