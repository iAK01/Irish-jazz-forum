// Location: app/components/members/steps/Media.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface MediaProps {
  register: UseFormRegister<any>;
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

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

export default function Media({ register, watch, setValue }: MediaProps) {
  const nationalMedia = watch("mediaPresence.featuredInNationalMedia") || [];
  const internationalMedia = watch("mediaPresence.featuredInInternationalMedia") || [];
  const socialMedia = watch("mediaPresence.socialMediaPlatforms") || [];

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
      <h2 className="text-2xl font-bold text-ijf-accent">Media & Visibility</h2>

      {/* Regular Media Coverage */}
      <label style={checkboxRowStyle}>
        <input type="checkbox" {...register("mediaPresence.hasRegularMediaCoverage")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Has Regular Media Coverage</span>
      </label>

      {/* National Media */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Featured in National Media</label>
        <p className="text-xs text-zinc-500 mb-2">e.g., Irish Times, RTÉ, Lyric FM</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="national-media-input" type="text" style={inputStyle} placeholder="e.g., Irish Times"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("national-media-input", nationalMedia, "mediaPresence.featuredInNationalMedia"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("national-media-input", nationalMedia, "mediaPresence.featuredInNationalMedia")}>Add</button>
        </div>
        {nationalMedia.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {nationalMedia.map((m: string) => (
              <span key={m} style={chipStyle}>
                {m}
                <button type="button" onClick={() => removeItem("mediaPresence.featuredInNationalMedia", nationalMedia, m)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* International Media */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Featured in International Media</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="international-media-input" type="text" style={inputStyle} placeholder="e.g., Jazz Times, DownBeat"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("international-media-input", internationalMedia, "mediaPresence.featuredInInternationalMedia"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("international-media-input", internationalMedia, "mediaPresence.featuredInInternationalMedia")}>Add</button>
        </div>
        {internationalMedia.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {internationalMedia.map((m: string) => (
              <span key={m} style={chipStyle}>
                {m}
                <button type="button" onClick={() => removeItem("mediaPresence.featuredInInternationalMedia", internationalMedia, m)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active Website */}
      <label style={checkboxRowStyle}>
        <input type="checkbox" {...register("mediaPresence.hasActiveWebsite")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Has Active Website</span>
      </label>

      {/* Social Media Platforms */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1">Social Media Platforms</label>
        <p className="text-xs text-zinc-500 mb-2">e.g., "Instagram: @myband" or "Facebook: facebook.com/mypage"</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input id="social-media-input" type="text" style={inputStyle} placeholder="e.g., Instagram: @dublinbigband"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("social-media-input", socialMedia, "mediaPresence.socialMediaPlatforms"); } }} />
          <button type="button" style={addBtnStyle} onClick={() => addItem("social-media-input", socialMedia, "mediaPresence.socialMediaPlatforms")}>Add</button>
        </div>
        {socialMedia.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {socialMedia.map((p: string) => (
              <span key={p} style={chipStyle}>
                {p}
                <button type="button" onClick={() => removeItem("mediaPresence.socialMediaPlatforms", socialMedia, p)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Jazz Ireland */}
      <label style={checkboxRowStyle}>
        <input type="checkbox" {...register("mediaPresence.participatesInJazzIreland")} style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "14px", color: "#374151" }}>Participates in Jazz Ireland</span>
      </label>
    </div>
  );
}