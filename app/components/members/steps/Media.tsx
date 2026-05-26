// Location: app/components/members/steps/Media.tsx

"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface MediaProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const IJF_GREEN = "#4CBB5A";

// ── Handle / URL normalisation ──────────────────────────────────────────────
// Accepts either a full URL or a bare handle / username and returns a full URL.
function normalizeLink(value: string, platform: string): string {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const handle = v.startsWith("@") ? v.slice(1) : v;
  switch (platform) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "youtube":   return `https://youtube.com/@${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "website":   return v.includes(".") ? `https://${v}` : v;
    default:          return v;
  }
}

// ── Reusable platform-link input row ────────────────────────────────────────
function LinkRow({
  label, dot, fieldName, placeholder, platform, register, setValue, watch,
}: {
  label: string;
  dot: string;
  fieldName: string;
  placeholder: string;
  platform: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{label}</span>
      </div>
      <input
        {...register(fieldName)}
        type="text"
        placeholder={placeholder}
        onBlur={(e) => {
          const normalized = normalizeLink(e.target.value, platform);
          if (normalized !== e.target.value) setValue(fieldName, normalized);
        }}
        style={{
          width: "100%", padding: "9px 14px",
          border: "1px solid #d1d5db", borderRadius: "8px",
          fontSize: "14px", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Chip list (for national/international media + other links) ───────────────
const chipStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "4px 12px", borderRadius: "9999px",
  fontSize: "13px", backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 500,
};

const addBtnStyle: React.CSSProperties = {
  flexShrink: 0, padding: "9px 18px",
  backgroundColor: IJF_GREEN, color: "white",
  border: "none", borderRadius: "8px",
  fontSize: "14px", fontWeight: 500, cursor: "pointer",
};

function ChipInput({
  id, field, items, placeholder, setValue,
}: {
  id: string; field: string; items: string[]; placeholder: string; setValue: UseFormSetValue<any>;
}) {
  const add = () => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el && el.value.trim() && !items.includes(el.value.trim())) {
      setValue(field, [...items, el.value.trim()]);
      el.value = "";
    }
  };
  const remove = (v: string) => setValue(field, items.filter((x: string) => x !== v));
  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input id={id} type="text" placeholder={placeholder}
          style={{ flex: 1, padding: "9px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" style={addBtnStyle} onClick={add}>Add</button>
      </div>
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {items.map((item: string) => (
            <span key={item} style={chipStyle}>
              {item}
              <button type="button" onClick={() => remove(item)}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "16px" }}>×</button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Media({ register, watch, setValue }: MediaProps) {
  const memberType    = watch("memberType") || [];
  const nationalMedia = watch("mediaPresence.featuredInNationalMedia") || [];
  const intlMedia     = watch("mediaPresence.featuredInInternationalMedia") || [];
  const otherLinks    = watch("contactInfo.other") || [];

  // Show music-streaming fields only for performing / recording member types
  const isMusicMember = (memberType as string[]).some(t =>
    ["artist", "collective", "label"].includes(t)
  );

  const sectionHead = (title: string, sub?: string) => (
    <div style={{ marginBottom: "14px" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h3>
      {sub && <p style={{ fontSize: "13px", color: "#6b7280", margin: "3px 0 0" }}>{sub}</p>}
    </div>
  );

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#f9fafb", padding: "16px 20px",
    borderRadius: "10px", border: "1px solid #e5e7eb",
    display: "flex", flexDirection: "column", gap: "12px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* ── 1. Website & Social Links ─────────────────────────────── */}
      <div>
        {sectionHead("Website & Social Links", "Enter a full URL or just a handle — we'll build the link automatically")}
        <div style={cardStyle}>
          <LinkRow label="Website"   dot="#4CBB5A" fieldName="contactInfo.website"   platform="website"   placeholder="https://yoursite.com"         register={register} setValue={setValue} watch={watch} />
          <LinkRow label="Facebook"  dot="#1877F2" fieldName="contactInfo.facebook"  platform="facebook"  placeholder="URL or page name"             register={register} setValue={setValue} watch={watch} />
          <LinkRow label="Instagram" dot="#E1306C" fieldName="contactInfo.instagram" platform="instagram" placeholder="URL or @handle"               register={register} setValue={setValue} watch={watch} />
          <LinkRow label="YouTube"   dot="#FF0000" fieldName="contactInfo.youtube"   platform="youtube"   placeholder="URL or @handle"               register={register} setValue={setValue} watch={watch} />
        </div>
      </div>

      {/* ── 2. Music & Streaming (artists / collectives / labels only) ─ */}
      {isMusicMember && (
        <div>
          {sectionHead("Music & Streaming", "Where people can listen to your music")}
          <div style={cardStyle}>
            <LinkRow label="Spotify"  dot="#1DB954" fieldName="contactInfo.spotify"  platform="spotify"  placeholder="https://open.spotify.com/artist/…" register={register} setValue={setValue} watch={watch} />
            <LinkRow label="Bandcamp" dot="#1DA0C3" fieldName="contactInfo.bandcamp" platform="bandcamp" placeholder="https://yourname.bandcamp.com"      register={register} setValue={setValue} watch={watch} />
          </div>
        </div>
      )}

      {/* ── 3. Other Links ─────────────────────────────────────────── */}
      <div>
        {sectionHead("Other Links", "X/Twitter, SoundCloud, LinkedIn — anything else")}
        <ChipInput
          id="other-links-input"
          field="contactInfo.other"
          items={otherLinks}
          placeholder='e.g. "X: @dublinbigband" or "SoundCloud: soundcloud.com/…"'
          setValue={setValue}
        />
      </div>

      {/* ── 4. Press & Media Coverage ─────────────────────────────── */}
      <div>
        {sectionHead("Press & Media Coverage", "Where you've been featured")}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { field: "mediaPresence.hasRegularMediaCoverage",   label: "Has regular media coverage" },
              { field: "mediaPresence.participatesInJazzIreland", label: "Participates in Jazz Ireland" },
            ].map(({ field, label }) => (
              <label key={field} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", backgroundColor: "#f9fafb",
                borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer",
              }}>
                <input type="checkbox" {...register(field)}
                  style={{ width: "15px", height: "15px", accentColor: IJF_GREEN }} />
                <span style={{ fontSize: "14px", color: "#374151" }}>{label}</span>
              </label>
            ))}
          </div>

          {/* National media */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Featured in National Media
              <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "6px" }}>e.g. Irish Times, RTÉ, Lyric FM</span>
            </label>
            <ChipInput id="national-media-input" field="mediaPresence.featuredInNationalMedia" items={nationalMedia} placeholder="e.g. Irish Times" setValue={setValue} />
          </div>

          {/* International media */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Featured in International Media
              <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "6px" }}>e.g. Jazz Times, DownBeat</span>
            </label>
            <ChipInput id="intl-media-input" field="mediaPresence.featuredInInternationalMedia" items={intlMedia} placeholder="e.g. Jazz Times" setValue={setValue} />
          </div>

        </div>
      </div>

    </div>
  );
}
