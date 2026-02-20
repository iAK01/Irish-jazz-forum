// Location: app/components/members/steps/CareerSupport.tsx

"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";

interface CareerSupportProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

const IJF_GREEN = "#4CBB5A";

const ITEMS = [
  { field: "careerSupport.offersMentorship", label: "Offers Mentorship", description: "One-to-one guidance for emerging artists" },
  { field: "careerSupport.providesAdminSupport", label: "Provides Admin Support", description: "Management, booking, and admin assistance" },
  { field: "careerSupport.hasBookingAgency", label: "Has Booking Agency", description: "In-house or affiliated booking representation" },
  { field: "careerSupport.providesRehearsalSpace", label: "Provides Rehearsal Space", description: "Space available for members or artists" },
  { field: "careerSupport.offersResidencies", label: "Offers Residencies", description: "Artist residency programmes" },
];

export default function CareerSupport({ register, watch }: CareerSupportProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ijf-accent">Career Support & Professional Development</h2>
      <p className="text-sm text-zinc-500">Select all the services and supports your organisation provides</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ITEMS.map(({ field, label, description }) => {
          const isChecked = watch(field);
          return (
            <label key={field}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                padding: "16px",
                borderRadius: "8px",
                border: `2px solid ${isChecked ? IJF_GREEN : "#e5e7eb"}`,
                cursor: "pointer",
                backgroundColor: isChecked ? "#f0fdf4" : "white",
                transition: "all 0.15s",
              }}>
              <input type="checkbox" {...register(field)}
                style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: IJF_GREEN, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}