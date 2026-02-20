// Location: app/components/members/steps/CrossBorder.tsx

"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";

interface CrossBorderProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
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

function ChipList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
      {items.map((item) => (
        <span key={item} style={chipStyle}>
          {item}
          <button type="button" onClick={() => onRemove(item)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </span>
      ))}
    </div>
  );
}

export default function CrossBorder({ watch, setValue }: CrossBorderProps) {
  const borderCounties = watch("crossBorderWork.borderCountiesServed") || [];
  const showcases = watch("internationalActivity.participatesInShowcases") || [];
  const partnerships = watch("internationalActivity.hasInternationalPartnerships") || [];
  const countries = watch("internationalActivity.countriesPresented") || [];

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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ijf-accent">Cross-Border & International</h2>

      {/* Border Counties */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Border Counties Served</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="border-county-input" type="text" style={inputStyle} placeholder="e.g., Donegal, Louth"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("border-county-input", borderCounties, "crossBorderWork.borderCountiesServed"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("border-county-input", borderCounties, "crossBorderWork.borderCountiesServed")}>Add</button>
        </div>
        <ChipList items={borderCounties} onRemove={(v) => removeItem("crossBorderWork.borderCountiesServed", borderCounties, v)} />
      </div>

      {/* International Showcases */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">International Showcases</label>
        <p className="text-xs text-zinc-500 mb-2">e.g., Jazzahead, WOMEX, Folk Alliance International</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="showcase-input" type="text" style={inputStyle} placeholder="e.g., Jazzahead"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("showcase-input", showcases, "internationalActivity.participatesInShowcases"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("showcase-input", showcases, "internationalActivity.participatesInShowcases")}>Add</button>
        </div>
        <ChipList items={showcases} onRemove={(v) => removeItem("internationalActivity.participatesInShowcases", showcases, v)} />
      </div>

      {/* International Partnerships */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">International Partnerships</label>
        <p className="text-xs text-zinc-500 mb-2">Organisations or venues abroad</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="partnership-input" type="text" style={inputStyle} placeholder="e.g., Berlin Jazz Festival"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("partnership-input", partnerships, "internationalActivity.hasInternationalPartnerships"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("partnership-input", partnerships, "internationalActivity.hasInternationalPartnerships")}>Add</button>
        </div>
        <ChipList items={partnerships} onRemove={(v) => removeItem("internationalActivity.hasInternationalPartnerships", partnerships, v)} />
      </div>

      {/* Countries Presented */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Countries Presented In</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="country-input" type="text" style={inputStyle} placeholder="e.g., Germany, France"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("country-input", countries, "internationalActivity.countriesPresented"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("country-input", countries, "internationalActivity.countriesPresented")}>Add</button>
        </div>
        <ChipList items={countries} onRemove={(v) => removeItem("internationalActivity.countriesPresented", countries, v)} />
      </div>
    </div>
  );
}