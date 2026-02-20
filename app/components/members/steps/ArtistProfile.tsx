// Location: app/components/members/steps/ArtistProfile.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface ArtistProfileProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

const IJF_GREEN = "#4CBB5A";

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

const addBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  backgroundColor: IJF_GREEN,
  color: "white",
  padding: "8px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "8px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
};

export default function ArtistProfile({ register, watch, setValue, errors }: ArtistProfileProps) {
  const instruments = watch("artistProfile.instruments") || [];
  const ensemblesLeading = watch("artistProfile.ensemblesLeading") || [];
  const ensemblesParticipating = watch("artistProfile.ensemblesParticipating") || [];

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

  const ChipRow = ({ items, field }: { items: string[]; field: string }) => {
    if (!items.length) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
        {items.map((item) => (
          <span key={item} style={chipStyle}>
            {item}
            <button type="button" onClick={() => removeItem(field, items, item)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Artist Profile</h2>

      {/* Instruments */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Instruments</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="instrument-input" type="text" style={inputStyle} placeholder="e.g., saxophone, piano"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("instrument-input", instruments, "artistProfile.instruments"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("instrument-input", instruments, "artistProfile.instruments")}>Add</button>
        </div>
        <ChipRow items={instruments} field="artistProfile.instruments" />
      </div>

      {/* Ensembles Leading */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Ensembles Leading</label>
        <p className="text-xs text-zinc-500 mb-2">Groups or bands you lead (enter member slug if they're in the directory)</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="ensemble-leading-input" type="text" style={inputStyle} placeholder="e.g., my-jazz-quartet"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("ensemble-leading-input", ensemblesLeading, "artistProfile.ensemblesLeading"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("ensemble-leading-input", ensemblesLeading, "artistProfile.ensemblesLeading")}>Add</button>
        </div>
        <ChipRow items={ensemblesLeading} field="artistProfile.ensemblesLeading" />
      </div>

      {/* Ensembles Participating */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Ensembles Participating In</label>
        <p className="text-xs text-zinc-500 mb-2">Groups or bands you play in</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="ensemble-participating-input" type="text" style={inputStyle} placeholder="e.g., dublin-big-band"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("ensemble-participating-input", ensemblesParticipating, "artistProfile.ensemblesParticipating"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("ensemble-participating-input", ensemblesParticipating, "artistProfile.ensemblesParticipating")}>Add</button>
        </div>
        <ChipRow items={ensemblesParticipating} field="artistProfile.ensemblesParticipating" />
      </div>

      {/* Years Active */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Years Active</label>
        <input type="number" {...register("artistProfile.yearsActive", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 focus:outline-none"
          placeholder="e.g., 15" />
      </div>

      {/* International Touring */}
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <input type="checkbox" {...register("artistProfile.hasInternationalTouringExperience")} style={{ width: "16px", height: "16px", accentColor: IJF_GREEN }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Has International Touring Experience</span>
      </label>
    </div>
  );
}