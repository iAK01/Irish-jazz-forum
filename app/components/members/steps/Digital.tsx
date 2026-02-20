// Location: app/components/members/steps/Digital.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface DigitalProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const IJF_GREEN = "#4CBB5A";
const SELECTED_STYLE = { backgroundColor: IJF_GREEN, borderColor: IJF_GREEN, color: "white" };
const UNSELECTED_STYLE = { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151" };

const SURVEY_CHANNELS = [
  { value: "email_lists", label: "Email Lists" },
  { value: "at_venue_qr", label: "At Venue QR Codes" },
  { value: "social_media", label: "Social Media" },
  { value: "website", label: "Website" },
];

export default function Digital({ register, watch, setValue }: DigitalProps) {
  const ticketingSystems = watch("ticketingSystemsUsed") || [];
  const crmTools = watch("crmOrMailingTools") || [];
  const analyticsTools = watch("analyticsTools") || [];
  const surveyChannels = watch("preferredSurveyChannels") || [];

  const addItem = (inputId: string, current: string[], field: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input && input.value.trim()) {
      const val = input.value.trim();
      if (!current.includes(val)) setValue(field, [...current, val]);
      input.value = "";
    }
  };

  const removeItem = (field: string, current: string[], value: string) => {
    setValue(field, current.filter((v: string) => v !== value));
  };

  const toggleSurveyChannel = (channel: string) => {
    if (surveyChannels.includes(channel)) {
      setValue("preferredSurveyChannels", surveyChannels.filter((c: string) => c !== channel));
    } else {
      setValue("preferredSurveyChannels", [...surveyChannels, channel]);
    }
  };

  const chipStyle: React.CSSProperties = {
    backgroundColor: IJF_GREEN,
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "14px",
    fontWeight: 500,
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Digital Capacity</h2>

      {/* Ticketing Systems */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">
          Ticketing Systems Used
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="ticketing-input"
            type="text"
            style={{ flex: 1, minWidth: 0, padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
            placeholder="e.g., Eventbrite, Ticketsolve, Tito"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("ticketing-input", ticketingSystems, "ticketingSystemsUsed"); } }}
          />
          <button type="button" onClick={() => addItem("ticketing-input", ticketingSystems, "ticketingSystemsUsed")}
            style={{ flexShrink: 0, backgroundColor: IJF_GREEN, color: "white", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
            Add
          </button>
        </div>
        {ticketingSystems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {ticketingSystems.map((s: string) => (
              <span key={s} style={chipStyle}>
                {s}
                <button type="button" onClick={() => removeItem("ticketingSystemsUsed", ticketingSystems, s)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CRM / Mailing Tools */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">
          CRM or Mailing Tools
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="crm-input"
            type="text"
            style={{ flex: 1, minWidth: 0, padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
            placeholder="e.g., Mailchimp, HubSpot, Monday"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("crm-input", crmTools, "crmOrMailingTools"); } }}
          />
          <button type="button" onClick={() => addItem("crm-input", crmTools, "crmOrMailingTools")}
            style={{ flexShrink: 0, backgroundColor: IJF_GREEN, color: "white", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
            Add
          </button>
        </div>
        {crmTools.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {crmTools.map((t: string) => (
              <span key={t} style={chipStyle}>
                {t}
                <button type="button" onClick={() => removeItem("crmOrMailingTools", crmTools, t)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Tools */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">
          Analytics Tools
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="analytics-input"
            type="text"
            style={{ flex: 1, minWidth: 0, padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
            placeholder="e.g., Google Analytics, Hotjar"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("analytics-input", analyticsTools, "analyticsTools"); } }}
          />
          <button type="button" onClick={() => addItem("analytics-input", analyticsTools, "analyticsTools")}
            style={{ flexShrink: 0, backgroundColor: IJF_GREEN, color: "white", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
            Add
          </button>
        </div>
        {analyticsTools.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {analyticsTools.map((t: string) => (
              <span key={t} style={chipStyle}>
                {t}
                <button type="button" onClick={() => removeItem("analyticsTools", analyticsTools, t)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Data Consent */}
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <input type="checkbox" {...register("consentToShareAggregatedData")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Consent to Share Aggregated Data</span>
      </label>

      {/* Preferred Survey Channels */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">
          Preferred Survey Channels
        </label>
        <p className="text-xs text-zinc-500 mb-3">Select all that apply</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {SURVEY_CHANNELS.map((channel) => {
            const isSelected = surveyChannels.includes(channel.value);
            return (
              <button
                key={channel.value}
                type="button"
                onClick={() => toggleSurveyChannel(channel.value)}
                style={{
                  ...(isSelected ? SELECTED_STYLE : UNSELECTED_STYLE),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <span>{channel.label}</span>
                {isSelected && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginLeft: "8px", flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}